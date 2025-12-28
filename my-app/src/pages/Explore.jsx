import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api";
function Explore() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${API_URL}/api/explore`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("抓取失敗", err));
  }, [API_URL]);
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (token) {
      fetch(`${API_URL}/api/me`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setCurrentUserId(data.user.id);
        })
        .catch(err => console.error("驗證失敗", err));
    }
  }, [API_URL]);
  const handleAddFriend = async () => {
    const token = localStorage.getItem('loginToken');
    if (!token) {
      alert('請先登入！');
      navigate('/login');
      return;
    }
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_URL}/api/add-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          friendId: selectedUser.id
        })
      });
      const result = await response.json();
      if (response.ok) {
        setSelectedUser(null);
        alert(`好友邀請已送出給 ${selectedUser.name}！`);
        navigate('/chat');
      } else {
        alert(result.error || '添加失敗');
      }
    } catch (error) {
      console.error('API 錯誤:', error);
      alert('連線發生錯誤');
    }
  };
  const getSkillBadgeStyle = () => ({
    background: 'linear-gradient(135deg, #ecfeff, #dbeafe)',
    color: '#0369a1',
    boxShadow: '0 1px 3px rgba(14,165,233,0.15)'
  });
  const getInterestBadgeStyle = () => ({
    background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    color: '#5b21b6',
    boxShadow: '0 1px 3px rgba(139,92,246,0.18)'
  });
  return (
    <div
      style={{
        padding: '72px 40px',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, rgba(148,163,184,0.18), transparent 60%)'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#0f172a'
          }}
        >
          探索學習夥伴
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '32px'
          }}
        >
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '28px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 18px 40px rgba(15,23,42,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 1px 3px rgba(15,23,42,0.06)';
              }}
            >
              <img
                src={user.avatar_url || 'https://via.placeholder.com/100'}
                alt="avatar"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '16px'
                }}
              />
              <h3 style={{ marginBottom: '10px', color: '#0f172a' }}>
                {user.name || '無名氏'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                專長
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                {user.skills
                  .filter(s => s.level === 3)
                  .slice(0, 3)
                  .map((s, i) => (
                    <span
                      key={i}
                      style={{
                        ...getSkillBadgeStyle(),
                        fontSize: '0.72rem',
                        padding: '6px 12px',
                        borderRadius: '999px'
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                想學
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {user.interests
                  .filter(s => s.level === 3)
                  .slice(0, 3)
                  .map((s, i) => (
                    <span
                      key={i}
                      style={{
                        ...getInterestBadgeStyle(),
                        fontSize: '0.72rem',
                        padding: '6px 12px',
                        borderRadius: '999px'
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
{selectedUser && (
  <div
    onClick={() => setSelectedUser(null)}
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '620px',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '40px',
        boxShadow: '0 40px 80px rgba(15,23,42,0.35)',
        position: 'relative'
      }}
    >
      <button
        onClick={() => setSelectedUser(null)}
        style={{
          position: 'absolute',
          right: '20px',
          top: '16px',
          fontSize: '26px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b'
        }}
      >
        ×
      </button>
      <div style={{ textAlign: 'center' }}>
        <img
          src={selectedUser.avatar_url || 'https://via.placeholder.com/150'}
          alt="avatar"
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '16px'
          }}
        />

        <h2 style={{ color: '#0f172a' }}>
          {selectedUser.name}
        </h2>

        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '14px',
            marginTop: '12px',
            color: '#475569'
          }}
        >
          "{selectedUser.bio || '這傢伙很懶，什麼都沒寫'}"
        </div>
      </div>
      <hr style={{ margin: '28px 0' }} />
      <h4>所有專長</h4>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {selectedUser.skills.map((s, i) => (
          <span
            key={i}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem'
            }}
          >
            {s.name} (L{s.level})
          </span>
        ))}
      </div>
      <h4 style={{ marginTop: '24px' }}>
        想學目標
      </h4>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {selectedUser.interests.map((s, i) => (
          <span
            key={i}
            style={{
              backgroundColor: '#f8fafc',
              color: '#475569',
              padding: '8px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem'
            }}
          >
            {s.name} (L{s.level})
          </span>
        ))}
      </div>
      <button
        onClick={handleAddFriend}
        disabled={currentUserId === selectedUser.id}
        style={{
          width: '100%',
          marginTop: '32px',
          padding: '14px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor:
            currentUserId === selectedUser.id
              ? '#e5e7eb'
              : '#0f172a',
          color:
            currentUserId === selectedUser.id
              ? '#94a3b8'
              : '#ffffff',
          cursor:
            currentUserId === selectedUser.id
              ? 'not-allowed'
              : 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        {currentUserId === selectedUser.id
          ? '這是你自己'
          : '發送好友申請 / 開始聊天'}
      </button>
    </div>
  </div>
)}
    </div>
  );
}
export default Explore;