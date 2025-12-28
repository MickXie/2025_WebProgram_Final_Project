import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";

function Chat() {
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
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

  const sharedFiles = messages.filter(m => m.file_url);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.friendListContainer}>
          <div style={styles.sidebarHeader}>
            Messaging
          </div>

          <div style={styles.friendList}>
            {invites.length > 0 && (
              <>
                <h4 style={styles.sectionTitle}>
                  REQUESTS <span style={styles.badge}>{invites.length}</span>
                </h4>
                {invites.map(invite => (
                  <div
                    key={`${invite.user_id}-${invite.friend_id}`}
                    onClick={() => setSelectedFriend({ id: invite.other_id, name: invite.name, avatar_url: invite.avatar_url, status: 'pending' })}
                    style={{
                      ...styles.friendItem,
                      ...(selectedFriend?.id === invite.other_id ? styles.activeFriendItem : {})
                    }}
                  >
                    <img src={invite.avatar_url || 'https://via.placeholder.com/40'} alt="avatar" style={styles.avatar} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                       <span style={styles.friendName}>{invite.name}</span>
                       <div style={{ fontSize: '0.75rem', color: '#999' }}>等待確認...</div>
                    </div>
                    {currentUserId === invite.friend_id && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={(e) => handleAcceptInvite(e, invite)} style={styles.actionBtn}>✓</button>
                        <button onClick={(e) => handleRejectInvite(e, invite)} style={{...styles.actionBtn, color: '#ff6b6b'}}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            <h4 style={styles.sectionTitle}>CONTACTS</h4>
            {friends.map(friend => (
              <div
                key={friend.id}
                style={{
                  ...styles.friendItem,
                  ...(selectedFriend?.id === friend.id ? styles.activeFriendItem : {})
                }}
                onClick={() => setSelectedFriend({ ...friend, status: 'accepted' })}
              >
                <img src={friend.avatar_url} alt="" style={styles.avatar} />
                <span style={styles.friendName}>{friend.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.filesSection}>
            <h4 style={styles.filesHeader}>Shared Content</h4>
            {selectedFriend ? (
                <div style={styles.fileGrid}>
                    {sharedFiles.length > 0 ? (
                        sharedFiles.map((m, idx) => (
                            <div key={idx} style={styles.fileItem}>
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
                                    {m.file_type && m.file_type.startsWith('image/') ? (
                                        <div style={styles.imageThumbnailBox}>
                                            <img src={m.file_url} alt="file" style={styles.imageThumbnail} />
                                        </div>
                                    ) : (
                                        <div style={styles.docIconBox}>
                                            <span style={{fontSize:'18px'}}>📄</span>
                                        </div>
                                    )}
                                </a>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyFilesState}>No files shared yet</div>
                    )}
                </div>
            ) : (
                <div style={styles.emptyFilesState}>Select a chat</div>
            )}
        </div>
      </div>
      <div style={styles.chatArea}>
        {selectedFriend ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={selectedFriend.avatar_url} alt="" style={styles.avatarSmall} />
                <div>
                    <h3 style={styles.chatTitle}>{selectedFriend.name}</h3>
                    {selectedFriend.status === 'pending' && (
                       <span style={styles.statusText}>Pending Request</span>
                    )}
                </div>
              </div>
              {selectedFriend.status === 'accepted' && (
                <button onClick={handleRemoveFriend} style={styles.iconButton} title="刪除好友">
                  <span style={{ fontSize: '1.2rem' }}>🗑</span>
                </button>
              )}
            </div>

            {selectedFriend.status === 'pending' && (
              <div style={styles.pendingTip}>
                🔒 尚未成為好友，雙方僅能傳送 2 則訊息
              </div>
            )}

            <div style={styles.messagesBox}>
              {messages.map((m, i) => {
                 const isMe = m.sender_id === currentUserId;
                 return (
                  <div key={i} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && <img src={selectedFriend.avatar_url} style={styles.msgAvatar} alt=""/>}
                    <div style={isMe ? styles.myBubble : styles.theirBubble}>
                      {m.file_url && (
                          <div style={{ marginBottom: m.content ? '8px' : '0' }}>
                              {m.file_type && m.file_type.startsWith('image/') ? (
                                  <img src={m.file_url} alt="sent content" style={styles.msgImage} />
                              ) : (
                                  <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={isMe ? styles.linkWhite : styles.linkBlack}>
                                      📄 下載檔案
                                  </a>
                              )}
                          </div>
                      )}
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputArea}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} 
                disabled={selectedFriend.status === 'pending' && mySentCount >= 2} 
                style={styles.clipButton}
              >
                📎
              </button>
              <div style={styles.inputWrapper}>
                  {selectedFile && (
                      <div style={styles.filePreviewChip}>
                          📄 {selectedFile.name}
                          <span style={{cursor:'pointer', marginLeft:'5px'}} onClick={() => setSelectedFile(null)}>✕</span>
                      </div>
                  )}
                  <input 
                    style={styles.input} 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    placeholder={selectedFriend.status === 'pending' && mySentCount >= 2 ? '功能受限' : '輸入訊息...'} 
                    disabled={selectedFriend.status === 'pending' && mySentCount >= 2} 
                  />
              </div>

              <button 
                type="submit" 
                style={styles.sendButton} 
                disabled={selectedFriend.status === 'pending' && mySentCount >= 2}
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div style={styles.emptyState}>
             <div style={styles.emptyStateIcon}>👋</div>
             <h2>Welcome Back</h2>
             <p>選擇一位好友開始交流技能</p>
          </div>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: 'flex',
    height: '85vh',
    maxWidth: '1100px', 
    margin: '30px auto',
    backgroundColor: '#fff', 
    borderRadius: '24px', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)', 
    overflow: 'hidden',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
  },
  sidebar: {
    width: '320px',
    backgroundColor: '#fafafa', 
    borderRight: '1px solid rgba(0,0,0,0.04)', 
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '24px 20px',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#333',
    letterSpacing: '-0.5px'
  },
  friendListContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 10px', 
  },
  sectionTitle: {
    padding: '15px 10px 5px 10px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  friendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px' 
  },
  friendItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    color: '#555',
    position: 'relative'
  },
  activeFriendItem: {
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    color: '#000',
    fontWeight: '500'
  },
  friendName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    letterSpacing: '0.3px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '14px', 
    marginRight: '12px',
    objectFit: 'cover',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  badge: {
    backgroundColor: '#ff4757',
    color: '#fff',
    borderRadius: '10px',
    padding: '2px 6px',
    marginLeft: '6px',
    fontSize: '0.65rem',
    verticalAlign: 'middle'
  },
  actionBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#4caf50',
    fontSize: '1rem',
    padding: '0 5px'
  },
  filesSection: {
    height: '180px', 
    borderTop: '1px solid rgba(0,0,0,0.05)',
    backgroundColor: '#fafafa',
    padding: '15px 20px',
    display: 'flex',
    flexDirection: 'column'
  },
  filesHeader: {
    margin: '0 0 10px 0',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  fileGrid: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto', 
    overflowY: 'hidden',
    paddingBottom: '5px',
    alignItems: 'center'
  },
  fileItem: {
    flexShrink: 0,
    width: '70px',
    height: '70px',
  },
  fileLink: {
    textDecoration: 'none',
    display: 'block',
    width: '100%',
    height: '100%'
  },
  imageThumbnailBox: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.9
  },
  docIconBox: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #eee',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  emptyFilesState: {
    color: '#ccc',
    fontSize: '0.8rem',
    marginTop: '10px',
    fontStyle: 'italic'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    position: 'relative'
  },
  chatHeader: {
    padding: '15px 30px',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px'
  },
  chatTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#222'
  },
  statusText: {
    fontSize: '0.8rem',
    color: '#999'
  },
  avatarSmall: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    objectFit: 'cover'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s'
  },
  messagesBox: {
    flex: 1,
    padding: '20px 30px',
    overflowY: 'auto',
    backgroundColor: '#fff', 
  },
  messageRow: {
    display: 'flex',
    marginBottom: '18px', 
    alignItems: 'flex-end' 
  },
  msgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    marginRight: '8px',
    marginBottom: '4px'
  },
  myBubble: {
    padding: '12px 18px',
    borderRadius: '18px 18px 4px 18px', 
    background: 'linear-gradient(135deg, #444, #2c2c2c)',
    color: '#fff',
    maxWidth: '65%',
    fontSize: '0.95rem',
    boxShadow: '0 4px 10px rgba(44, 44, 44, 0.2)',
    lineHeight: '1.5'
  },
  theirBubble: {
    padding: '12px 18px',
    borderRadius: '18px 18px 18px 4px',
    backgroundColor: '#fff',
    border: '1px solid #f0f0f0',
    color: '#333',
    maxWidth: '65%',
    fontSize: '0.95rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    lineHeight: '1.5'
  },
  msgImage: {
    maxWidth: '100%',
    borderRadius: '10px',
    marginTop: '5px'
  },
  linkWhite: { color: '#fff', textDecoration: 'underline', fontSize: '0.9rem' },
  linkBlack: { color: '#333', textDecoration: 'underline', fontSize: '0.9rem' },
  inputArea: {
    padding: '20px 30px',
    borderTop: '1px solid rgba(0,0,0,0.04)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    backgroundColor: '#fff'
  },
  clipButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    color: '#666',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f5f7f9', 
    borderRadius: '24px',
    padding: '4px 15px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '44px',
    border: '1px solid transparent',
    transition: 'border 0.2s, background 0.2s'
  },
  input: {
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.95rem',
    color: '#333',
    padding: '8px 0'
  },
  filePreviewChip: {
    fontSize: '0.8rem',
    color: '#666',
    backgroundColor: '#e0e0e0',
    padding: '2px 8px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    transition: 'transform 0.1s'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#ccc'
  },
  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    opacity: 0.5
  },
  pendingTip: {
    backgroundColor: '#fffcf0', 
    color: '#bfa15f',
    padding: '10px 15px',
    textAlign: 'center',
    fontSize: '0.85rem',
    borderBottom: '1px solid #f5ebd6'
  }
};
export default Chat;