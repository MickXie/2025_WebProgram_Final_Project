import React, { useState, useEffect } from 'react';
// 1. 引入 useNavigate 用於頁面跳轉
import { useNavigate } from 'react-router-dom';

function Explore() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // 存放目前點擊的使用者
  const [currentUserId, setCurrentUserId] = useState(null); // 2. 存放當前登入者的 ID

  const navigate = useNavigate(); // 初始化導航鉤子
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  // 取得使用者列表
  useEffect(() => {
    fetch(`${API_URL}/api/explore`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("抓取失敗", err));
  }, [API_URL]);

  // 3. 確認當前登入者身分 (為了知道是誰在加好友)
  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    if (token) {
      fetch(`${API_URL}/api/me`, {
        headers: { 'Authorization': token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      })
      .catch(err => console.error("驗證失敗", err));
    }
  }, [API_URL]);

  // 4. 處理「加好友並聊天」的函式
  const handleAddFriend = async () => {
    if (!currentUserId) {
      alert("請先登入！");
      navigate('/login');
      return;
    }

    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_URL}/api/add-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,   // 我 (發起人)
          friendId: selectedUser.id // 對方 (目標)
        })
      });

      const result = await response.json();

      if (response.ok) {
        // 成功後，關閉 Modal 並導向聊天室
        setSelectedUser(null);
        alert(`已成功將 ${selectedUser.name} 加入好友！即將前往聊天室...`);
        navigate('/chat'); 
      } else {
        alert(result.error || "添加失敗");
      }
    } catch (error) {
      console.error("API 錯誤:", error);
      alert("連線發生錯誤");
    }
  };

  const getLevelColor = (level) => level === 3 ? '#2E7D32' : level === 2 ? '#4CAF50' : '#81C784';
  const getGoalColor = (level) => level === 3 ? '#512DA8' : level === 2 ? '#7E57C2' : '#B39DDB';

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>探索學習夥伴</h2>

      {/* Grid 列表 (維持原本樣式) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '30px' 
      }}>
        {users.map(user => (
          // 如果是自己，可以選擇不顯示，或者顯示但不能點擊 (這裡先照常顯示)
          <div 
            key={user.id} 
            onClick={() => setSelectedUser(user)}
            style={{ 
              backgroundColor: '#fff', borderRadius: '15px', padding: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer',
              transition: 'transform 0.2s', textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src={user.avatar_url || 'https://via.placeholder.com/100'} alt="avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} />
            <h3 style={{ margin: '10px 0' }}>{user.name || '無名氏'}</h3>
            
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>專長 :</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px', marginBottom: '15px' }}>
              {user.skills.filter(s => s.level === 3).slice(0, 3).map((s, i) => (
                <span key={i} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>{s.name}</span>
              ))}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>想學 :</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
              {user.interests.filter(s => s.level === 3).slice(0, 3).map((s, i) => (
                <span key={i} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '10px', backgroundColor: '#F3E5F5', color: '#512DA8' }}>{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 放大卡片 Modal */}
      {selectedUser && (
        <div 
          onClick={() => setSelectedUser(null)} 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              backgroundColor: '#fff', padding: '40px', borderRadius: '20px', 
              width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
              position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            
            <div style={{ textAlign: 'center' }}>
                <img src={selectedUser.avatar_url || 'https://via.placeholder.com/150'} alt="avatar" 
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
                <h2>{selectedUser.name}</h2>
                <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>"{selectedUser.bio || '這傢伙很懶，什麼都沒寫'}"</p>
            </div>

            <hr />
            
            <h4>💪 所有專長</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {selectedUser.skills.map((s, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: getLevelColor(s.level), color: '#fff', fontSize: '0.85rem' }}>
                  {s.name} (L{s.level})
                </span>
              ))}
            </div>

            <h4>🎯 想學目標</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {selectedUser.interests.map((s, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: getGoalColor(s.level), color: '#fff', fontSize: '0.85rem' }}>
                  {s.name} (L{s.level})
                </span>
              ))}
            </div>

            {/* 修改按鈕：綁定 onClick 事件，且如果是自己則停用按鈕 */}
            <button 
                onClick={handleAddFriend}
                disabled={currentUserId === selectedUser.id}
                style={{ 
                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none', 
                    backgroundColor: currentUserId === selectedUser.id ? '#ccc' : '#333', 
                    color: '#fff', cursor: currentUserId === selectedUser.id ? 'not-allowed' : 'pointer', 
                    fontSize: '1rem' 
                }}
            >
                {currentUserId === selectedUser.id ? '這是你自己' : '發送好友申請 / 開始聊天'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;