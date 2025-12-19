import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [friends, setFriends] = useState([]); // 好友列表
  const [selectedFriend, setSelectedFriend] = useState(null); // 當前聊天對象
  const [messages, setMessages] = useState([]); // 聊天記錄
  const [inputText, setInputText] = useState(''); // 輸入框
  const [currentUserId, setCurrentUserId] = useState(null); // 我的 ID
  
  const messagesEndRef = useRef(null); // 用來自動捲動到底部
  const navigate = useNavigate();
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  // 1. 初始化：驗證身分並抓取好友列表
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) { navigate('/login'); return; }

    // 抓取我的 ID
    fetch(`${API_URL}/api/me`, { headers: { 'Authorization': token } })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
            setCurrentUserId(data.user.id);
            // 抓取好友列表
            return fetch(`${API_URL}/api/my-friends`, { headers: { 'Authorization': token } });
        }
      })
      .then(res => res.json())
      .then(data => setFriends(data || []))
      .catch(err => console.error("初始化錯誤", err));

  }, [API_URL, navigate]);

  // 2. 核心：Polling 機制 (AJAX 輪詢)
  // 當選擇了朋友，每 2 秒去後端抓一次最新訊息
  useEffect(() => {
    if (!selectedFriend || !currentUserId) return;

    const fetchMessages = () => {
      const token = localStorage.getItem('loginToken');
      fetch(`${API_URL}/api/messages/${selectedFriend.id}`, {
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("訊息抓取錯誤", err));
    };

    // 立即抓第一次
    fetchMessages();

    // 設定計時器，每 2000ms (2秒) 抓一次
    const intervalId = setInterval(fetchMessages, 2000);

    // 清除計時器 (當切換朋友或離開頁面時)
    return () => clearInterval(intervalId);

  }, [selectedFriend, currentUserId, API_URL]);

  // 自動捲動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. 發送訊息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedFriend) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId: selectedFriend.id,
      content: inputText
    };

    // 樂觀更新 UI (不等後端回傳，先顯示在畫面上，體驗較好)
    // 註：因為有 Polling，其實不寫這行過兩秒也會出現，但寫了感覺更即時
    setMessages([...messages, { ...newMessage, created_at: new Date().toISOString() }]);
    setInputText('');

    try {
      await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      // 發送成功後，Polling 會在下次循環抓到確認的資料
    } catch (error) {
      console.error("發送失敗", error);
      alert("訊息發送失敗");
    }
  };

  return (
    <div style={styles.container}>
      {/* 左側：好友列表 */}
      <div style={styles.sidebar}>
        <h3 style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>💬 訊息列表</h3>
        <div style={styles.friendList}>
          {friends.length === 0 ? (
            <p style={{ padding: '20px', color: '#888' }}>還沒有好友，快去探索頁加好友吧！</p>
          ) : (
            friends.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => setSelectedFriend(friend)}
                style={{
                  ...styles.friendItem,
                  backgroundColor: selectedFriend?.id === friend.id ? '#e3f2fd' : 'transparent'
                }}
              >
                <img src={friend.avatar_url || 'https://via.placeholder.com/40'} alt="avatar" style={styles.avatar} />
                <span>{friend.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右側：聊天視窗 */}
      <div style={styles.chatArea}>
        {selectedFriend ? (
          <>
            <div style={styles.chatHeader}>
              <img src={selectedFriend.avatar_url || 'https://via.placeholder.com/40'} alt="avatar" style={styles.avatarSmall} />
              <h3>{selectedFriend.name}</h3>
            </div>
            
            <div style={styles.messagesBox}>
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={index} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.messageBubble, backgroundColor: isMe ? '#2196F3' : '#f1f1f1', color: isMe ? '#fff' : '#000' }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputArea}>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="輸入訊息..." 
                style={styles.input}
              />
              <button type="submit" style={styles.sendButton}>發送</button>
            </form>
          </>
        ) : (
          <div style={styles.emptyState}>
            <h2>👈 選擇一位好友開始聊天</h2>
          </div>
        )}
      </div>
    </div>
  );
}

// 簡單的 CSS Styles (可以直接放在檔案下方或 index.css)
const styles = {
  container: { display: 'flex', height: 'calc(100vh - 80px)', maxWidth: '1200px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' },
  sidebar: { width: '25%', borderRight: '1px solid #ddd', backgroundColor: '#f9f9f9', overflowY: 'auto' },
  friendList: { display: 'flex', flexDirection: 'column' },
  friendItem: { display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' },
  avatarSmall: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' },
  chatArea: { width: '75%', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', backgroundColor: '#fff' },
  messagesBox: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#fff' },
  messageRow: { display: 'flex', marginBottom: '10px' },
  messageBubble: { padding: '10px 15px', borderRadius: '20px', maxWidth: '60%', wordWrap: 'break-word', fontSize: '0.95rem' },
  inputArea: { padding: '20px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px', backgroundColor: '#f9f9f9' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' },
  sendButton: { padding: '10px 25px', borderRadius: '20px', border: 'none', backgroundColor: '#2196F3', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  emptyState: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#aaa' }
};

export default Chat;