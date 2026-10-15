import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import ReactMarkdown from 'react-markdown';
import { getImageUrl } from '../utils/imageHelper';

const quickRepliesList = [
  { icon: '🔥', text: 'Món nào bán chạy nhất?' },
  { icon: '🥤', text: 'Gợi ý trà sữa & đồ uống' },
  { icon: '🍔', text: 'Mình muốn ăn đồ ăn nhanh' },
  { icon: '💰', text: 'Hôm nay có khuyến mãi gì?' }
];

export default function ChatWidget({ foods = [], addToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ 
      sender: 'bot', 
      text: 'Chào bạn! Trợ lý AI FastBite đã sẵn sàng. Hôm nay bạn muốn dùng món gì ạ? 🍕🥤',
      productIds: [] 
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const res = await axiosClient.post('/Chatbot/SendMessage', {
        maNguoiDung: user ? user.id : null,
        noiDung: text
      });

      // 🎯 BẮT MẠCH AXIOS (Chuẩn hóa dữ liệu)
      let payload = res;
      if (res && res.data !== undefined) {
          payload = res.data;
      }
      if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch (e) {}
      }

      console.log("👉 Dữ liệu AI (ML.NET + Gemini) trả về:", payload);

      const botMessage = payload?.message || payload?.Message || "Dạ, FastBite đã nhận yêu cầu!";
      
      // Lấy danh sách ID đã được AI chốt
      const botProductIds = payload?.suggestedProductIds || payload?.SuggestedProductIds || payload?.suggested_product_ids || [];

      setMessages([...newMessages, { 
          sender: 'bot', 
          text: botMessage,
          productIds: Array.isArray(botProductIds) ? botProductIds : []
      }]);

    } catch (error) {
      setMessages([...newMessages, { 
          sender: 'bot', 
          text: "Dạ hệ thống AI đang bận xử lý, bạn vui lòng chờ 1 phút rồi nhắn lại nhé! ⏳",
          productIds: []
      }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="chat-widget-container" style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 9999, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      
      <style>
        {`
          @keyframes slide-up { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
          .typing-indicator span { display: inline-block; width: 6px; height: 6px; background-color: #e74c3c; border-radius: 50%; margin: 0 2px; animation: bounce 1.3s linear infinite; }
          .typing-indicator span:nth-child(2) { animation-delay: -1.1s; } .typing-indicator span:nth-child(3) { animation-delay: -0.9s; }
          @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

          .chat-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .chat-scrollbar::-webkit-scrollbar-thumb { background: #ffcec9; border-radius: 10px; }

          .chat-premium-window { width: 360px; height: 550px; background-color: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; margin-bottom: 20px; animation: slide-up 0.3s forwards; border: 1px solid rgba(0,0,0,0.08); }
          .chat-premium-header { background: #e74c3c; color: #fff; padding: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; }
          
          .bubble-bot { background: #fff; border: 1px solid #f1f2f6; color: #333; padding: 12px 15px; border-radius: 15px; font-size: 14.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); line-height: 1.5; word-wrap: break-word; }
          .bubble-user { background: #e74c3c; color: #fff; padding: 10px 15px; border-radius: 15px; font-size: 14.5px; line-height: 1.5; }

          /* THẺ SẢN PHẨM TRONG KHUNG CHAT */
          .inline-pro-card { display: flex; gap: 12px; background: #fff; border: 1px solid #ffeaa7; border-radius: 10px; padding: 10px; margin-top: 12px; box-shadow: 0 2px 8px rgba(230,126,34,0.08); align-items: center; width: 100%; box-sizing: border-box; transition: 0.2s; }
          .inline-pro-card:hover { border-color: #ffcec9; transform: translateY(-2px); }
          .inline-pro-img { width: 65px; height: 65px; border-radius: 8px; object-fit: cover; flex-shrink: 0; border: 1px solid #f1f2f6; }
          .inline-pro-info { flex: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
          .inline-pro-name { font-weight: 700; color: #2d3436; font-size: 14px; line-height: 1.3; }
          .inline-pro-price { color: #e74c3c; font-weight: 800; font-size: 14px; }
          .inline-add-btn { background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; width: fit-content; transition: 0.2s; margin-top: 2px; }
          .inline-add-btn:hover { background: #c0392b; }

          .premium-reply-btn { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; padding: 8px 14px; border: 1px solid #ffcec9; border-radius: 20px; background: #fff; color: #e74c3c; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .premium-reply-btn:hover { background: #e74c3c; color: #fff; border-color: #e74c3c; }

          .premium-input-area { display: flex; padding: 12px; background: #fff; border-top: 1px solid #eee; align-items: center; gap: 10px; }
          .premium-input { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14.5px; background: #fdfdfd; transition: 0.3s; }
          .premium-input:focus { border-color: #e74c3c; }
          .premium-send-btn { background: #e74c3c; color: #fff; border: none; border-radius: 50%; width: 42px; height: 42px; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 16px; flex-shrink: 0; transition: 0.2s; }
          .premium-send-btn:hover { transform: scale(1.05); }
        `}
      </style>

      {isOpen && (
        <div className="chat-premium-window">
          <div className="chat-premium-header">
            🤖 FastBite AI Assistant
          </div>
          
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '15px' }} className="chat-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                
                {msg.sender === 'user' && (
                  <div className="bubble-user" style={{ maxWidth: '85%' }}>{msg.text}</div>
                )}

                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%', width: '100%' }}>
                    
                    <div className="bubble-bot" style={{ width: '100%', boxSizing: 'border-box' }}>
                      
                      {/* In chữ */}
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                      
                      {/* Đính Thẻ dựa vào Mảng ID (Bao lô toàn bộ trường hợp Key) */}
                      {msg.productIds && msg.productIds.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                          {msg.productIds.map((id, pIdx) => {
                              const realFood = foods.find(f => 
                                  Number(f.maMon) === Number(id) || 
                                  Number(f.MaMon) === Number(id) || 
                                  Number(f.ma_mon) === Number(id) ||
                                  Number(f.id) === Number(id)
                              );
                              
                              if (!realFood) return null;

                              const name = realFood.tenMon || realFood.TenMon || realFood.ten_mon;
                              const price = Number(realFood.giaBan || realFood.gia || realFood.Gia || realFood.gia_ban || 0);
                              const formattedPrice = price.toLocaleString('vi-VN') + 'đ';
                              let imageUrl = 'https://placehold.co/100x100/e74c3c/FFF?text=FastBite';
                              if (realFood.hinhAnh || realFood.HinhAnh || realFood.hinh_anh) {
                                  imageUrl = getImageUrl(realFood.hinhAnh || realFood.HinhAnh || realFood.hinh_anh);
                              }

                              return (
                                <div key={pIdx} className="inline-pro-card">
                                  <img src={imageUrl} alt={name} className="inline-pro-img" onError={(e) => { e.target.src = 'https://placehold.co/100x100/e74c3c/FFF?text=FastBite'; }} />
                                  <div className="inline-pro-info">
                                    <div className="inline-pro-name">{name}</div>
                                    <div className="inline-pro-price">{formattedPrice}</div>
                                    <button 
                                      className="inline-add-btn" 
                                      onClick={() => addToCart && addToCart({ ...realFood, soLuong: 1 })}
                                    >
                                      🛒 Thêm giỏ
                                    </button>
                                  </div>
                                </div>
                              );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div className="bubble-bot" style={{ padding: '14px 18px', maxWidth: '85%' }}>
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '10px 15px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }} className="chat-scrollbar">
              {quickRepliesList.map((reply, idx) => (
                <button key={idx} className="premium-reply-btn" onClick={() => handleSendMessage(reply.text)}>
                  {reply.icon} {reply.text}
                </button>
              ))}
            </div>
          </div>

          <div className="premium-input-area">
            <input 
              className="premium-input" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)} 
              placeholder="Hỏi món ăn bạn đang thèm..."
            />
            <button className="premium-send-btn" onClick={() => handleSendMessage(inputText)}>➤</button>
          </div>
        </div>
      )}
      
      <button 
        style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '60px', height: '60px', fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(231,76,60,0.4)', transition: 'all 0.3s' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}