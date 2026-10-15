import React, { useCallback, useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';

const MAX_HISTORY_ITEMS = 4;
const VIETNAMESE_LOCALE = 'vi-VN';

const ELEVENLABS_API_KEY = 'sk_9e26326dd51ff3fd41d27035b1df1ef05790b0fea65162cb'; 
const ELEVENLABS_VOICE_ID = 'EhsQPbR40wdcrGuGdk8P';

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.maNguoiDung ?? user?.id ?? null;
  } catch {
    return null;
  }
}

function getHttpErrorMessage(error) {
  const payload = error?.response?.data ?? error;
  const status = error?.response?.status ?? payload?.status ?? payload?.statusCode;
  const backendMessage = payload?.message ?? error?.message ?? 'Không thể kết nối đến máy chủ.';
  if (Number(status) === 429) return 'HTTP 429 - Quota Exceeded: ' + backendMessage;
  return status ? 'HTTP ' + status + ': ' + backendMessage : backendMessage;
}

export default function VoiceBot() {
  const recognitionRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [history, setHistory] = useState([]);
  const [debugError, setDebugError] = useState('');

  const speakTextWithElevenLabs = useCallback(async (text) => {
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/[*#_~`]/g, '').trim();
    if (!cleanText) return;

    setIsSpeaking(true);
    setDebugError('');

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85, 
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const exactReason = errorData?.detail?.message || errorData?.detail || JSON.stringify(errorData);
        throw new Error(`Bắt tại trận lỗi ${response.status}: ${exactReason}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); 
      };

      audio.play();
    } catch (error) {
      console.error('Lỗi phát âm thanh AI:', error);
      setDebugError(error.message);
      setIsSpeaking(false);
    }
  }, []);

  const appendHistory = useCallback((item) => {
    setHistory((previous) => [...previous, item].slice(-MAX_HISTORY_ITEMS));
  }, []);

  const sendToBackend = useCallback(
    async (userText) => {
      const normalizedText = userText.trim();
      if (!normalizedText) return;

      appendHistory({ id: Date.now(), role: 'user', text: normalizedText });
      setIsLoading(true);
      setDebugError('');

      try {
        const data = await axiosClient.post('/VoiceBot/ask', {
          maNguoiDung: getUserId(),
          userText: normalizedText
        });

        const aiText = data?.aiText || data?.data?.aiText || data?.message || data?.data?.message;
        if (!aiText) throw new Error('Backend không trả về nội dung tư vấn hợp lệ.');

        appendHistory({ id: Date.now() + 1, role: 'assistant', text: aiText });
        
        await speakTextWithElevenLabs(aiText);
        
      } catch (error) {
        const errorMessage = getHttpErrorMessage(error);
        setDebugError(errorMessage);
        appendHistory({ id: Date.now() + 1, role: 'error', text: 'BÁO LỖI: ' + errorMessage });
      } finally {
        setIsLoading(false);
      }
    },
    [appendHistory, speakTextWithElevenLabs]
  );

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = VIETNAMESE_LOCALE;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      void sendToBackend(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted') setDebugError('STT Lỗi: ' + event.error);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
  }, [sendToBackend]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setDebugError('Trình duyệt không hỗ trợ thu âm.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    setDebugError('');
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      setDebugError('Không thể bật Micro: ' + (error.message || 'Lỗi không xác định.'));
      setIsListening(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fastbite-ripple-1 { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
          @keyframes fastbite-ripple-2 { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.2); opacity: 0; } }
          @keyframes ai-speaking-pulse { 0% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 88, 12, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); } }
          
          /* HIỆU ỨNG SÓNG ÂM */
          @keyframes sound-bounce {
            0%, 100% { height: 6px; }
            50% { height: 18px; }
          }
          .waveform {
            display: flex;
            align-items: center;
            gap: 3px;
            height: 20px;
            margin-left: 8px;
          }
          .waveform .bar {
            width: 3px;
            background: #ea580c;
            border-radius: 2px;
            animation: sound-bounce 0.8s infinite ease-in-out;
          }
          .waveform .bar:nth-child(1) { animation-delay: 0.0s; }
          .waveform .bar:nth-child(2) { animation-delay: 0.2s; }
          .waveform .bar:nth-child(3) { animation-delay: 0.4s; }
          .waveform .bar:nth-child(4) { animation-delay: 0.1s; }
          
          .avatar-glow {
            animation: ai-speaking-pulse 1.5s infinite;
          }

          .voicebot-btn-container { position: fixed; bottom: 100px; right: 30px; z-index: 99999; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
          .voicebot-ripple { position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #ea580c; z-index: -1; pointer-events: none; }
          .voicebot-ripple.r1 { animation: fastbite-ripple-1 2s infinite cubic-bezier(0.25, 0.8, 0.5, 1); }
          .voicebot-ripple.r2 { animation: fastbite-ripple-2 2s infinite cubic-bezier(0.25, 0.8, 0.5, 1); animation-delay: 0.5s; }
          .voicebot-core-btn { width: 100%; height: 100%; border-radius: 50%; background-color: #ea580c; color: #ffffff; border: none; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3); font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; z-index: 10; }
          .voicebot-core-btn:hover { transform: scale(1.05); }
          .voicebot-core-btn.open { background-color: #4b5563; box-shadow: 0 4px 15px rgba(75, 85, 99, 0.3); }
          .is-speaking-btn { animation: ai-speaking-pulse 1.5s infinite; background-color: #c2410c; }
        `}
      </style>

      <div className="voicebot-btn-container">
        {!isOpen && <div className="voicebot-ripple r1"></div>}
        {!isOpen && <div className="voicebot-ripple r2"></div>}
        <button
          className={`voicebot-core-btn ${isOpen ? 'open' : ''} ${isSpeaking ? 'is-speaking-btn' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✖' : isSpeaking ? '🔊' : '🎙️'}
        </button>
      </div>

      <div style={{ position: 'fixed', bottom: '170px', right: '30px', zIndex: 99998, width: '350px', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: isOpen ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden', border: '1px solid #fed7aa', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#ea580c', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Nhân viên tư vấn tự động
          </h2>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fafaf9', maxHeight: '60vh', overflowY: 'auto' }}>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Hỏi món ăn hoặc giá bán bằng giọng nói.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isSpeechSupported || isLoading || isSpeaking}
              style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: isListening ? '#ef4444' : (isSpeaking ? '#10b981' : '#ea580c'), color: '#fff', border: 'none', fontSize: '24px', cursor: (!isSpeechSupported || isLoading || isSpeaking) ? 'not-allowed' : 'pointer', opacity: (!isSpeechSupported || isLoading) ? 0.6 : 1, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isListening ? '🛑' : (isSpeaking ? '🔊' : '🎤')}
            </button>
            <p style={{ marginTop: '12px', fontSize: '13px', fontWeight: 'bold', color: '#6b7280' }}>
              {isLoading ? 'AI đang suy nghĩ...' : isListening ? 'Đang lắng nghe anh/chị nói...' : isSpeaking ? 'AI đang trả lời...' : 'Bấm vào Micro để nói'}
            </p>
          </div>

          {debugError && (
            <div style={{ marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
              <strong>Lỗi:</strong> {debugError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px dashed #e5e7eb', margin: 0 }}>
                Lịch sử hội thoại sẽ xuất hiện tại đây.
              </p>
            ) : (
              history.map((message, index) => {
                const isUser = message.role === 'user';
                const isLastMessage = index === history.length - 1;
                
                return (
                  <div key={message.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    
                    {/* Phần Header của tin nhắn AI (Gồm Avatar, Tên và Sóng âm) */}
                    {!isUser ? (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                        <img 
                          src="/ceo-tho.jpg" // 👈 SẾP THAY ĐƯỜNG DẪN ẢNH VÀO ĐÂY NHÉ
                          alt="AI Avatar" 
                          className={isSpeaking && isLastMessage ? "avatar-glow" : ""}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ea580c' }} 
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Thơ&background=ea580c&color=fff"; }} // Fallback tự tạo chữ T nếu chưa có ảnh
                        />
                        <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 'bold' }}>
                          Trợ lý Minh Thơ
                        </span>
                        
                        {/* 🔴 SÓNG ÂM CHỈ HIỆN KHI AI ĐANG ĐỌC TIN NHẮN CUỐI CÙNG */}
                        {isSpeaking && isLastMessage && (
                          <div className="waveform">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', padding: '0 4px' }}>Bạn</span>
                    )}

                    <div style={{
                      backgroundColor: isUser ? '#ffedd5' : '#ffffff',
                      color: isUser ? '#9a3412' : '#1f2937',
                      border: isUser ? 'none' : '1px solid #f3f4f6',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderTopRightRadius: isUser ? '4px' : '16px',
                      borderTopLeftRadius: !isUser ? '4px' : '16px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      maxWidth: '90%',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}>
                      {message.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}