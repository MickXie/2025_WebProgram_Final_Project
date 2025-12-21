import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MatchOverlay = ({ currentUser, matchedUser, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // 🎵 這裡播放你的 Valorant 音效
    // const audio = new Audio('/sounds/match-found.mp3');
    // audio.volume = 0.5;
    // audio.play().catch(e => console.log("Audio play failed", e));

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(timer);
      navigate('/chat');
    }

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  if (!matchedUser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden">
      
      {/* 內嵌動畫樣式：模擬 Valorant 的重擊感 */}
      <style>{`
        /* 1. 標題重擊進場 (配合 DUN! 音效) */
        @keyframes slamIn {
          0% { opacity: 0; transform: scale(4) translateY(-50px); filter: blur(10px); }
          70% { opacity: 1; transform: scale(0.9); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* 2. 背景線條流動 (營造速度感) */
        @keyframes slideBg {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        /* 3. 角色卡片滑入 */
        @keyframes cardSlideLeft {
          from { opacity: 0; transform: translateX(-100px) skewX(-10deg); }
          to { opacity: 1; transform: translateX(0) skewX(0); }
        }
        @keyframes cardSlideRight {
          from { opacity: 0; transform: translateX(100px) skewX(10deg); }
          to { opacity: 1; transform: translateX(0) skewX(0); }
        }

        .anim-slam { animation: slamIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .anim-card-l { animation: cardSlideLeft 0.5s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .anim-card-r { animation: cardSlideRight 0.5s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        
        /* 呼吸燈邊框 */
        .pulse-border {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          animation: pulse-white 1.5s infinite;
        }
        @keyframes pulse-white {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>

      {/* 背景裝飾線條 (選用) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%, transparent 50%, #333 50%, #333 75%, transparent 75%, transparent)', 
             backgroundSize: '40px 40px',
             animation: 'slideBg 20s linear infinite'
           }}>
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4 text-center">
        
        {/* --- 標題區：巨大、斜體、衝擊感 --- */}
        <div className="anim-slam mb-16 relative">
            {/* 裝飾用的背景大字 (Ghost Text) */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black italic text-white/5 whitespace-nowrap select-none scale-150">
                MATCH FOUND
            </span>
            
            <h1 className="text-6xl sm:text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                MATCH FOUND
            </h1>
            <div className="mt-2 h-1 w-full bg-white rounded-full mx-auto max-w-[200px]"></div>
            <p className="mt-4 text-lg font-bold text-slate-400 uppercase tracking-widest">
                Skill Exchange Protocol Initiated
            </p>
        </div>

        {/* --- 對戰卡片區 --- */}
        <div className="flex w-full items-center justify-center gap-4 sm:gap-12 mb-16">
          
          {/* 左邊：我 (卡片風格) */}
          <div className="anim-card-l flex flex-col items-center">
            <div className="relative mb-4">
               <div className="h-28 w-28 sm:h-36 sm:w-36 overflow-hidden border-4 border-slate-500 bg-slate-800 rotate-3 transition-transform hover:rotate-0 duration-300">
                  <img 
                    src={currentUser?.avatar_url || "https://via.placeholder.com/150"} 
                    alt="Me" 
                    className="h-full w-full object-cover opacity-90 hover:opacity-100" 
                  />
               </div>
               {/* 裝飾角標 */}
               <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
               <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>
            </div>
            <span className="text-xl font-bold text-white uppercase tracking-wider">{currentUser?.name || "YOU"}</span>
            <span className="text-xs text-slate-500 font-mono mt-1">READY</span>
          </div>

          {/* 中間：VS / 連接符號 */}
          <div className="flex flex-col items-center justify-center mx-2">
            <div className="pulse-border rounded-full p-3 bg-white text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
          </div>

          {/* 右邊：對方 (卡片風格) */}
          <div className="anim-card-r flex flex-col items-center">
            <div className="relative mb-4">
               <div className="h-28 w-28 sm:h-36 sm:w-36 overflow-hidden border-4 border-white bg-slate-200 -rotate-3 transition-transform hover:rotate-0 duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <img 
                    src={matchedUser?.avatar_url || "https://via.placeholder.com/150"} 
                    alt="Opponent" 
                    className="h-full w-full object-cover" 
                  />
               </div>
               {/* 裝飾角標 */}
               <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
               <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            </div>
            <span className="text-xl font-bold text-white uppercase tracking-wider">{matchedUser?.name || "PARTNER"}</span>
            <span className="text-xs text-slate-400 font-mono mt-1">FOUND</span>
          </div>

        </div>

        {/* --- 按鈕區 --- */}
        <div className="w-full max-w-md space-y-3 anim-card-l" style={{animationDelay: '0.4s'}}>
            <button 
                onClick={() => navigate('/chat')}
                className="
                    group relative w-full overflow-hidden bg-white py-4 text-center
                    transition-transform active:scale-95
                "
            >
                {/* 斜切背景裝飾 */}
                <div className="absolute inset-0 bg-slate-200 translate-y-full transition-transform group-hover:translate-y-0 duration-300"></div>
                
                <span className="relative z-10 text-xl font-black italic tracking-widest text-slate-900 group-hover:text-slate-900">
                    ACCEPT MATCH ({timeLeft})
                </span>
            </button>

            <button 
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
            >
                Decline & Return to Queue
            </button>
        </div>

      </div>
    </div>
  );
};

export default MatchOverlay;