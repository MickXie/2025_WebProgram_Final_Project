import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ 檔案上傳相關 State
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  /* =====================
     初始化：驗證 + 抓資料
     ===================== */
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/api/me`, { headers: { Authorization: token } })
      .then(res => res.json())
      .then(data => {
        if (!data.user) return;
        setCurrentUserId(data.user.id);

        return fetch(`${API_URL}/api/my-friends`, {
          headers: { Authorization: token }
        });
      })
      .then(res => res && res.json())
      .then(friendsData => {
        if (friendsData) setFriends(friendsData);

        return fetch(`${API_URL}/api/friend-requests`, {
          headers: { Authorization: token }
        });
      })
      .then(res => res && res.json())
      .then(invitesData => {
        if (invitesData) setInvites(invitesData);
      })
      .catch(err => console.error('初始化錯誤', err));
  }, [API_URL, navigate]);

  /* =====================
     ⭐ 輪巡好友邀請
     ===================== */
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) return;

    const fetchInvites = () => {
      fetch(`${API_URL}/api/friend-requests`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInvites(data);
          }
        })
        .catch(err => console.error('好友邀請輪巡失敗', err));
    };

    fetchInvites();
    const timer = setInterval(fetchInvites, 5000);
    return () => clearInterval(timer);
  }, [API_URL]);

  /* =====================
     ⭐ 輪巡好友列表
     ===================== */
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (!token) return;

    const fetchFriends = () => {
      fetch(`${API_URL}/api/my-friends`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFriends(data);
          }
        })
        .catch(err => console.error('好友列表輪巡失敗', err));
    };

    fetchFriends();
    const timer = setInterval(fetchFriends, 8000);
    return () => clearInterval(timer);
  }, [API_URL]);

  /* =====================
     Polling 抓聊天訊息
     ===================== */
  useEffect(() => {
    if (!selectedFriend || !currentUserId) return;
    const token = localStorage.getItem('loginToken');

    const fetchMessages = () => {
      fetch(`${API_URL}/api/messages/${selectedFriend.id}`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error('訊息抓取錯誤', err));
    };

    fetchMessages();
    const timer = setInterval(fetchMessages, 2000);
    return () => clearInterval(timer);
  }, [selectedFriend, currentUserId, API_URL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* =====================
     發送訊息（文字 + 檔案）
     ===================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !selectedFriend) return;

    if (selectedFriend.status === 'pending') {
      const myCount = messages.filter(m => m.sender_id === currentUserId).length;
      if (myCount >= 2) {
        alert('尚未通過好友邀請，無法再傳送更多訊息');
        return;
      }
    }

    let uploadedFileUrl = null;
    let uploadedFileType = null;

    if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const uploadRes = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await uploadRes.json();
            if (data.fileUrl) {
                uploadedFileUrl = data.fileUrl;
                uploadedFileType = data.fileType;
            } else {
                alert('檔案上傳失敗');
                return;
            }
        } catch (err) {
            console.error('上傳錯誤', err);
            alert('檔案上傳發生錯誤');
            return;
        }
    }

    const payload = {
      senderId: currentUserId,
      receiverId: selectedFriend.id,
      content: inputText,
      fileUrl: uploadedFileUrl,
      fileType: uploadedFileType
    };

    setMessages([
      ...messages,
      {
        ...payload,
        sender_id: currentUserId,
        file_url: uploadedFileUrl,
        file_type: uploadedFileType,
        created_at: new Date().toISOString()
      }
    ]);
    
    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  // ... (handleAcceptInvite, handleRejectInvite, handleRemoveFriend 省略，保持不變) ...
  const handleAcceptInvite = async (e, invite) => {
    e.stopPropagation();
    const token = localStorage.getItem('loginToken');
    const res = await fetch(`${API_URL}/api/accept-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ userId: invite.user_id, friendId: invite.friend_id })
    });
    if (res.ok) {
      setInvites(invites.filter(i => i !== invite));
      setFriends([...friends, { id: invite.other_id, name: invite.name, avatar_url: invite.avatar_url, status: 'accepted' }]);
    }
  };

  const handleRejectInvite = async (e, invite) => {
    e.stopPropagation();
    const token = localStorage.getItem('loginToken');
    const res = await fetch(`${API_URL}/api/reject-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ userId: invite.user_id, friendId: invite.friend_id })
    });
    if (res.ok) setInvites(invites.filter(i => i !== invite));
  };

  const handleRemoveFriend = async () => {
    if (!selectedFriend) return;
    const ok = window.confirm(`確定要刪除 ${selectedFriend.name} 嗎？`);
    if (!ok) return;
    const token = localStorage.getItem('loginToken');
    const res = await fetch(`${API_URL}/api/remove-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ friendId: selectedFriend.id })
    });
    if (res.ok) {
      setFriends(friends.filter(f => f.id !== selectedFriend.id));
      setSelectedFriend(null);
      setMessages([]);
    }
  };

  const mySentCount =
    selectedFriend?.status === 'pending'
      ? messages.filter(m => m.sender_id === currentUserId).length
      : 0;

  /* =====================
     ✅ 新增：計算目前聊天室的所有學習資料 (檔案/圖片)
     ===================== */
  const sharedFiles = messages.filter(m => m.file_url);

  return (
    <div style={styles.container}>
      {/* Sidebar - 改為 Flex Column 讓下面可以放檔案區 */}
      <div style={styles.sidebar}>
        
        {/* 上半部：好友列表 (flex: 1 自動填滿剩餘空間) */}
        <div style={styles.friendListContainer}>
          <div style={styles.friendList}>
            {invites.length > 0 && (
              <>
                <h4 style={{ padding: '15px' }}>
                  好友邀請 <span style={styles.badge}>{invites.length}</span>
                </h4>
                {invites.map(invite => (
                  <div
                    key={`${invite.user_id}-${invite.friend_id}`}
                    onClick={() => setSelectedFriend({ id: invite.other_id, name: invite.name, avatar_url: invite.avatar_url, status: 'pending' })}
                    style={{
                      ...styles.friendItem,
                      backgroundColor: selectedFriend?.id === invite.other_id ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <img src={invite.avatar_url || 'https://via.placeholder.com/40'} alt="avatar" style={styles.avatar} />
                    <span style={{ marginRight: 'auto' }}>{invite.name}</span>
                    {currentUserId === invite.friend_id ? (
                      <>
                        <button onClick={(e) => handleAcceptInvite(e, invite)} style={{ marginRight: '5px' }}>接受</button>
                        <button onClick={(e) => handleRejectInvite(e, invite)}>拒絕</button>
                      </>
                    ) : (
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>已送出</span>
                    )}
                  </div>
                ))}
              </>
            )}

            <h4 style={{ padding: '15px' }}>好友列表</h4>
            {friends.map(friend => (
              <div
                key={friend.id}
                style={{
                  ...styles.friendItem,
                  backgroundColor: selectedFriend?.id === friend.id ? '#e3f2fd' : 'transparent'
                }}
                onClick={() => setSelectedFriend({ ...friend, status: 'accepted' })}
              >
                <img src={friend.avatar_url} alt="" style={styles.avatar} />
                <span>{friend.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ 下半部：學習資料整合區 (固定高度或比例) */}
        <div style={styles.filesSection}>
            <h4 style={styles.filesHeader}>📂 學習資料整合</h4>
            {selectedFriend ? (
                <div style={styles.fileGrid}>
                    {sharedFiles.length > 0 ? (
                        sharedFiles.map((m, idx) => (
                            <div key={idx} style={styles.fileItem}>
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {m.file_type && m.file_type.startsWith('image/') ? (
                                        <div style={styles.imageThumbnailBox}>
                                            <img src={m.file_url} alt="file" style={styles.imageThumbnail} />
                                        </div>
                                    ) : (
                                        <div style={styles.docIconBox}>
                                            📄 <span style={{fontSize:'10px'}}>文件</span>
                                        </div>
                                    )}
                                </a>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px', color: '#999', fontSize: '0.9rem' }}>
                            尚無分享的資料
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '10px', color: '#999', fontSize: '0.9rem' }}>
                    請先選擇好友
                </div>
            )}
        </div>

      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedFriend ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={selectedFriend.avatar_url} alt="" style={styles.avatarSmall} />
                <h3>{selectedFriend.name}</h3>
              </div>
              {selectedFriend.status === 'accepted' && (
                <button onClick={handleRemoveFriend} style={styles.dangerButton}>刪除好友</button>
              )}
            </div>

            {selectedFriend.status === 'pending' && (
              <div style={styles.pendingTip}>尚未通過好友邀請，雙方各最多可傳送 2 則訊息</div>
            )}

            <div style={styles.messagesBox}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...styles.messageRow, justifyContent: m.sender_id === currentUserId ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...styles.messageBubble, backgroundColor: m.sender_id === currentUserId ? '#2196F3' : '#f1f1f1', color: m.sender_id === currentUserId ? '#fff' : '#000' }}>
                    {m.file_url && (
                        <div style={{ marginBottom: m.content ? '8px' : '0' }}>
                            {m.file_type && m.file_type.startsWith('image/') ? (
                                <img src={m.file_url} alt="sent content" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} />
                            ) : (
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{ color: m.sender_id === currentUserId ? '#fff' : 'blue', textDecoration: 'underline', fontWeight: 'bold' }}>
                                    📄 下載檔案
                                </a>
                            )}
                        </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputArea}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={selectedFriend.status === 'pending' && mySentCount >= 2} style={{ ...styles.sendButton, backgroundColor: '#aaa', padding: '10px 15px' }}>📎</button>
              <input style={styles.input} value={inputText} onChange={e => setInputText(e.target.value)} placeholder={selectedFriend.status === 'pending' && mySentCount >= 2 ? '無法傳送更多訊息' : selectedFile ? `已選擇: ${selectedFile.name}` : '輸入訊息...'} disabled={selectedFriend.status === 'pending' && mySentCount >= 2} />
              <button type="submit" style={styles.sendButton} disabled={selectedFriend.status === 'pending' && mySentCount >= 2}>發送</button>
            </form>
          </>
        ) : (
          <div style={styles.emptyState}><h2>👈 選擇一位好友開始聊天</h2></div>
        )}
      </div>
    </div>
  );
}

/* =====================
   Styles (已更新)
   ===================== */
const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: '24px', 
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  sidebar: {
    width: '28%',
    borderRight: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    // ✅ 修改：讓 sidebar 變成 Flex 直向，方便分割上下區
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' 
  },
  // ✅ 新增：包裹好友列表的容器 (Flex 1 佔滿上方)
  friendListContainer: {
    flex: 1,
    overflowY: 'auto'
  },
  friendList: {
    display: 'flex',
    flexDirection: 'column'
  },
  friendItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    marginRight: '12px',
    objectFit: 'cover'
  },
  avatarSmall: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  // ✅ 新增：檔案區塊樣式
  filesSection: {
    height: '35%', // 佔 sidebar 下方 35% 高度
    borderTop: '2px solid #ddd',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column'
  },
  filesHeader: {
    padding: '10px 15px',
    margin: 0,
    backgroundColor: '#eee',
    fontSize: '0.95rem',
    color: '#555'
  },
  fileGrid: {
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignContent: 'flex-start'
  },
  fileItem: {
    width: '60px',
    height: '60px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  imageThumbnailBox: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #eee'
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  docIconBox: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ccc',
    fontSize: '1.2rem'
  },
  chatArea: {
    width: '72%',
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeader: {
    padding: '15px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  messagesBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto'
  },
  messageRow: {
    display: 'flex',
    marginBottom: '10px'
  },
  messageBubble: {
    padding: '10px 15px',
    borderRadius: '18px',
    maxWidth: '65%',
    wordWrap: 'break-word',
    fontSize: '0.95rem'
  },
  inputArea: {
    padding: '15px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    gap: '10px',
    backgroundColor: '#f9f9f9'
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none'
  },
  sendButton: {
    padding: '10px 24px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#2196F3',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#aaa'
  },
  pendingTip: {
    backgroundColor: '#fff8e1',
    color: '#8a6d3b',
    padding: '10px 15px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd'
  },
  dangerButton: {
    background: 'none',
    border: 'none',
    color: '#e53935',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  badge: {
    backgroundColor: 'red',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    marginLeft: '8px',
    fontSize: '0.8rem'
  }
};

export default Chat;