import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

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
     ⭐ 輪巡好友邀請（你原本就有）
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
     ⭐ 新增：輪巡好友列表（accepted）
     - 讓接受邀請後不用重整就會出現在好友列表
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
    const timer = setInterval(fetchFriends, 8000); // 每 8 秒抓一次
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
     發送訊息（含 2 則限制）
     ===================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedFriend) return;

    if (selectedFriend.status === 'pending') {
      const myCount = messages.filter(m => m.sender_id === currentUserId).length;
      if (myCount >= 2) {
        alert('尚未通過好友邀請，無法再傳送更多訊息');
        return;
      }
    }

    const payload = {
      senderId: currentUserId,
      receiverId: selectedFriend.id,
      content: inputText
    };

    setMessages([
      ...messages,
      {
        ...payload,
        sender_id: currentUserId,
        created_at: new Date().toISOString()
      }
    ]);
    setInputText('');

    await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  /* =====================
     接受好友邀請（只能被邀請者看到按鈕）
     ===================== */
  const handleAcceptInvite = async (e, invite) => {
    e.stopPropagation();

    const token = localStorage.getItem('loginToken');
    const res = await fetch(`${API_URL}/api/accept-friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        userId: invite.user_id,
        friendId: invite.friend_id
      })
    });

    const result = await res.json().catch(() => ({}));

    if (res.ok) {
      setInvites(invites.filter(i => i !== invite));
      setFriends([
        ...friends,
        {
          id: invite.other_id,
          name: invite.name,
          avatar_url: invite.avatar_url,
          status: 'accepted'
        }
      ]);
    } else {
      alert(result?.error || '接受邀請失敗');
    }
  };

  /* =====================
     拒絕好友邀請
     ===================== */
  const handleRejectInvite = async (e, invite) => {
    e.stopPropagation();

    const token = localStorage.getItem('loginToken');
    const res = await fetch(`${API_URL}/api/reject-friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        userId: invite.user_id,
        friendId: invite.friend_id
      })
    });

    const result = await res.json().catch(() => ({}));
    if (res.ok) {
      setInvites(invites.filter(i => i !== invite));
    } else {
      alert(result?.error || '拒絕邀請失敗');
    }
  };

  /* =====================
     刪除好友（你原本的功能保留）
     ===================== */
  const handleRemoveFriend = async () => {
    if (!selectedFriend) return;

    const ok = window.confirm(`確定要刪除 ${selectedFriend.name} 嗎？`);
    if (!ok) return;

    const token = localStorage.getItem('loginToken');

    const res = await fetch(`${API_URL}/api/remove-friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ friendId: selectedFriend.id })
    });

    const result = await res.json().catch(() => ({}));

    if (res.ok) {
      setFriends(friends.filter(f => f.id !== selectedFriend.id));
      setSelectedFriend(null);
      setMessages([]);
    } else {
      alert(result?.error || '刪除好友失敗');
    }
  };

  const mySentCount =
    selectedFriend?.status === 'pending'
      ? messages.filter(m => m.sender_id === currentUserId).length
      : 0;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.friendList}>
          {invites.length > 0 && (
            <>
              <h4 style={{ padding: '15px' }}>
                好友邀請
                <span style={styles.badge}>{invites.length}</span>
              </h4>

              {invites.map(invite => (
                <div
                  key={`${invite.user_id}-${invite.friend_id}`}
                  onClick={() =>
                    setSelectedFriend({
                      id: invite.other_id,
                      name: invite.name,
                      avatar_url: invite.avatar_url,
                      status: 'pending'
                    })
                  }
                  style={{
                    ...styles.friendItem,
                    backgroundColor:
                      selectedFriend?.id === invite.other_id ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <img
                    src={invite.avatar_url || 'https://via.placeholder.com/40'}
                    alt="avatar"
                    style={styles.avatar}
                  />
                  <span style={{ marginRight: 'auto' }}>{invite.name}</span>

                  {currentUserId === invite.friend_id ? (
                    <>
                      <button
                        onClick={(e) => handleAcceptInvite(e, invite)}
                        style={{ marginRight: '5px' }}
                      >
                        接受
                      </button>
                      <button onClick={(e) => handleRejectInvite(e, invite)}>
                        拒絕
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>
                      已送出邀請
                    </span>
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
                backgroundColor:
                  selectedFriend?.id === friend.id ? '#e3f2fd' : 'transparent'
              }}
              onClick={() =>
                setSelectedFriend({ ...friend, status: 'accepted' })
              }
            >
              <img src={friend.avatar_url} alt="" style={styles.avatar} />
              <span>{friend.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={styles.chatArea}>
        {selectedFriend ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={selectedFriend.avatar_url}
                  alt=""
                  style={styles.avatarSmall}
                />
                <h3>{selectedFriend.name}</h3>
              </div>

              {selectedFriend.status === 'accepted' && (
                <button
                  onClick={handleRemoveFriend}
                  style={styles.dangerButton}
                >
                  刪除好友
                </button>
              )}
            </div>

            {selectedFriend.status === 'pending' && (
              <div style={styles.pendingTip}>
                尚未通過好友邀請，雙方各最多可傳送 2 則訊息
              </div>
            )}

            <div style={styles.messagesBox}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.messageRow,
                    justifyContent:
                      m.sender_id === currentUserId
                        ? 'flex-end'
                        : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      backgroundColor:
                        m.sender_id === currentUserId ? '#2196F3' : '#f1f1f1',
                      color:
                        m.sender_id === currentUserId ? '#fff' : '#000'
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputArea}>
              <input
                style={styles.input}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  selectedFriend.status === 'pending' && mySentCount >= 2
                    ? '好友邀請尚未通過，無法再傳送更多訊息'
                    : '輸入訊息...'
                }
                disabled={
                  selectedFriend.status === 'pending' && mySentCount >= 2
                }
              />
              <button
                type="submit"
                style={styles.sendButton}
                disabled={
                  selectedFriend.status === 'pending' && mySentCount >= 2
                }
              >
                發送
              </button>
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

/* =====================
   你原本完整 Styles（保留不刪）
   ===================== */
const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    maxWidth: '1200px',
    margin: '0 auto',
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  sidebar: {
    width: '28%',
    borderRight: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
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
