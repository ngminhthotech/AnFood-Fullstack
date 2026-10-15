using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.ML;
using Microsoft.ML.Trainers;
using AnFoodAPI.Models;
using AnFoodAPI.Models.AI;

namespace AnFoodAPI.Services
{
    public interface IRecommendationService
    {
        string TrainModel(List<AiLichSuHanhVi> trainingData);
        float PredictScore(int userId, int productId);
    }

    public class RecommendationService : IRecommendationService
    {
        private readonly MLContext _mlContext;
        private readonly string _modelPath;
        private readonly string _tempModelPath;
        private readonly string _backupModelPath;
        
        // 👉 Dùng 'volatile' để đảm bảo an toàn luồng (Thread-safe) khi tráo đổi bộ não
        private volatile PredictionEngine<ProductEntry, ProductPrediction> _predictionEngine;
        private readonly object _lockObj = new object(); // Khóa bảo vệ khi đọc/ghi file

        public RecommendationService()
        {
            _mlContext = new MLContext();
            
            // Khai báo 3 file để làm Zero-Downtime Swap
            _modelPath = Path.Combine(Environment.CurrentDirectory, "FastBite_AI_Model.zip");
            _tempModelPath = Path.Combine(Environment.CurrentDirectory, "FastBite_AI_Model_temp.zip");
            _backupModelPath = Path.Combine(Environment.CurrentDirectory, "FastBite_AI_Model_backup.zip");
        }

        public string TrainModel(List<AiLichSuHanhVi> rawData)
        {
            try
            {
                var mlData = rawData.Select(x => new ProductEntry
                {
                    UserId = x.MaNguoiDung ?? 0, 
                    ProductId = x.MaMon,
                    Label = x.DiemHanhVi
                }).ToList();

                IDataView trainingDataView = _mlContext.Data.LoadFromEnumerable(mlData);

                var pipeline = _mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "UserIdEncoded", inputColumnName: nameof(ProductEntry.UserId))
                    .Append(_mlContext.Transforms.Conversion.MapValueToKey(outputColumnName: "ProductIdEncoded", inputColumnName: nameof(ProductEntry.ProductId)))
                    .Append(_mlContext.Recommendation().Trainers.MatrixFactorization(
                        new MatrixFactorizationTrainer.Options
                        {
                            MatrixColumnIndexColumnName = "UserIdEncoded",
                            MatrixRowIndexColumnName = "ProductIdEncoded",
                            LabelColumnName = nameof(ProductEntry.Label),
                            NumberOfIterations = 20, 
                            ApproximationRank = 100  
                        }));


                // Chia dữ liệu thành tập huấn luyện (80%) và tập kiểm thử (20%) để đánh giá
                var dataSplit = _mlContext.Data.TrainTestSplit(trainingDataView, testFraction: 0.2);
                var trainData = dataSplit.TrainSet;
                var testData = dataSplit.TestSet;

                Console.WriteLine("🚀 Bắt đầu huấn luyện AI ngầm (Không gián đoạn)...");
                var model = pipeline.Fit(trainData);

                // Đánh giá mô hình trên tập kiểm thử
                var predictions = model.Transform(testData);
                var metrics = _mlContext.Recommendation().Evaluate(predictions, labelColumnName: nameof(ProductEntry.Label), scoreColumnName: "Score");

                Console.WriteLine($"\n--- 📊 KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH ML.NET ---");
                Console.WriteLine($"RMSE (Root Mean Squared Error): {metrics.RootMeanSquaredError:F4} (Càng gần 0 càng tốt)");
                Console.WriteLine($"R-Squared: {metrics.RSquared:F4} (Càng gần 1 càng tốt)");
                Console.WriteLine($"MAE (Mean Absolute Error): {metrics.MeanAbsoluteError:F4}");
                Console.WriteLine($"------------------------------------------\n");

                // 🔥 BƯỚC 1: Lưu Model mới vào file NHÁP (Tránh khóa file chính)
                _mlContext.Model.Save(model, trainData.Schema, _tempModelPath);
                
                // 🔥 BƯỚC 2: Khởi tạo một Bộ Não mới tinh từ file nháp lên RAM
                ITransformer newTrainedModel = _mlContext.Model.Load(_tempModelPath, out var modelSchema);
                var newPredictionEngine = _mlContext.Model.CreatePredictionEngine<ProductEntry, ProductPrediction>(newTrainedModel);

                // 🔥 BƯỚC 3: Tráo đổi file vật lý an toàn
                lock (_lockObj)
                {
                    if (File.Exists(_modelPath))
                    {
                        File.Copy(_modelPath, _backupModelPath, true); // Backup file cũ lỡ có lỗi
                    }
                    File.Copy(_tempModelPath, _modelPath, true); // Đè file mới lên file chính
                }

                // 🔥 BƯỚC 4: Tráo đổi bộ não trong RAM (Atomic Swap siêu tốc)
                _predictionEngine = newPredictionEngine;

                // Dọn rác file nháp
                if (File.Exists(_tempModelPath))
                {
                    File.Delete(_tempModelPath);
                }
                
                return $"✅ Huấn luyện thành công! AI đã cập nhật không gián đoạn.\n" +
                $"--- 📊 KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH ---\n" +
                $"RMSE : {metrics.RootMeanSquaredError:F4}\n" +
                $"R2   : {metrics.RSquared:F4}\n" +
                $"MAE  : {metrics.MeanAbsoluteError:F4}";
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ LỖI HUẤN LUYỆN AI: " + ex.Message);
                
                // Khôi phục file backup nếu quá trình đè file bị lỗi
                if (File.Exists(_backupModelPath) && !File.Exists(_modelPath))
                {
                    File.Copy(_backupModelPath, _modelPath, true);
                }
                
                return "Lỗi huấn luyện: " + ex.Message;
            }
        }

        public float PredictScore(int userId, int productId)
        {
            // Lấy reference hiện tại để đảm bảo không bị NULL giữa chừng do Thread khác đang Train
            var engine = _predictionEngine; 

            // Nếu máy chủ vừa chạy lại, chưa có Model trên RAM thì mới load từ ổ cứng
            if (engine == null)
            {
                lock (_lockObj) // Khóa lại không cho 2 người cùng load file 1 lúc
                {
                    if (_predictionEngine == null)
                    {
                        if (!File.Exists(_modelPath)) return 0f;
                        ITransformer trainedModel = _mlContext.Model.Load(_modelPath, out var modelSchema);
                        _predictionEngine = _mlContext.Model.CreatePredictionEngine<ProductEntry, ProductPrediction>(trainedModel);
                    }
                    engine = _predictionEngine;
                }
            }

            // Gọi dự đoán từ RAM với tốc độ chớp mắt
            var prediction = engine.Predict(new ProductEntry
            {
                UserId = userId,
                ProductId = productId
            });

            if (float.IsNaN(prediction.Score)) return 0f;

            return prediction.Score;
        }
    }
}