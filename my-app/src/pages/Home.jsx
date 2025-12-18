import { Link } from "react-router-dom";
import { Meteors } from "@/components/ui/meteors";

export default function Home() {
  return (
    <main className="snap-y snap-mandatory scroll-smooth no-scrollbar">
      {/* ======================================================
         Hero Section — h-screen + 流星範圍控制
         ====================================================== */}
      <section className="relative h-screen w-full snap-start overflow-hidden bg-white">
        {/* Meteors（限制在上半部 + 固定寬度） */}
        <div
          className="
            absolute
            left-1/2 top-0
            h-[65%]
            w-[1200px]
            -translate-x-1/2
            overflow-hidden
          "
        >
          <Meteors
            number={22}
            minDuration={5}
            maxDuration={12}
            className="bg-slate-800 shadow-[0_0_0_1px_#00000025]"
          />
        </div>

        {/* Content */}
        <div
          className="
            relative z-10
            mx-auto
            flex h-full
            max-w-6xl
            flex-col
            items-center
            justify-center
            px-6
            text-center
          "
        >
          <p
            className="
              mb-4
              tracking-widest
              text-slate-500
              text-[clamp(0.75rem,1.2vw,0.9rem)]
            "
          >
            SKILLSWAP PLATFORM
          </p>

          <h1
            className="
              mb-6
              font-semibold
              leading-tight
              text-slate-900
              text-[clamp(2.4rem,5vw,4rem)]
            "
          >
            讓學習不再孤單
            <br />
            <span className="text-slate-600">
              讓專長找到真正的價值
            </span>
          </h1>

          <p
            className="
              mb-12
              max-w-2xl
              leading-relaxed
              text-slate-500
              text-[clamp(1rem,1.8vw,1.2rem)]
            "
          >
            透過興趣標籤與技能配對，
            在安全的環境中找到你的學習夥伴，
            讓知識交換變得自然且有溫度。
          </p>

          <Link to="/explore">
            <button
              className="
                rounded-md
                border border-slate-300
                px-8 py-4
                text-slate-800
                transition
                hover:bg-slate-100
                text-[clamp(0.9rem,1.6vw,1.05rem)]
              "
            >
              開始探索 →
            </button>
          </Link>
        </div>
      </section>

      {/* ======================================================
         About Section — h-screen
         ====================================================== */}
      <section className="h-screen snap-start bg-white flex items-center px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-2">
          {/* Left */}
          <div>
            <h2
              className="
                mb-10
                font-semibold
                text-slate-900
                text-[clamp(1.8rem,3.5vw,2.6rem)]
              "
            >
              關於技能交換平台
            </h2>

            <div className="space-y-10">
              <div>
                <h3
                  className="
                    mb-3
                    font-medium
                    text-slate-900
                    text-[clamp(1.05rem,1.8vw,1.2rem)]
                  "
                >
                  專案理念
                </h3>
                <p
                  className="
                    leading-relaxed
                    text-slate-600
                    text-[clamp(1rem,1.6vw,1.15rem)]
                  "
                >
                  本平台以「技能交換」為核心，
                  讓使用者依據興趣、技能與背景進行配對，
                  打造一個重視信任、互助與成長的學習社群。
                </p>
              </div>

              <div>
                <h3
                  className="
                    mb-3
                    font-medium
                    text-slate-900
                    text-[clamp(1.05rem,1.8vw,1.2rem)]
                  "
                >
                  開發團隊
                </h3>
                <ul
                  className="
                    space-y-2
                    text-slate-600
                    text-[clamp(0.95rem,1.5vw,1.1rem)]
                  "
                >
                  <li>
                    <strong className="text-slate-900">
                      01357043 謝侑均
                    </strong>{" "}
                    — 前端介面、UI / UX 設計
                  </li>
                  <li>
                    <strong className="text-slate-900">
                      01357031 顏家駿
                    </strong>{" "}
                    — 後端開發、演算法設計
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center">
            <div
              className="
                h-[420px]
                w-full
                rounded-xl
                border border-dashed border-slate-300
                bg-slate-50
                flex items-center justify-center
                text-slate-400
                text-[clamp(0.9rem,1.5vw,1rem)]
              "
            >
              圖片 / UI 展示區
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
         Footer — 自訂高度（不再 h-screen）
         ====================================================== */}
      <section
        className="
          snap-start
          bg-black
          h-[320px]
          flex
          items-center
          justify-center
          px-6
        "
      >
        <div className="text-center">
          <p className="mb-2 text-slate-400 text-[clamp(0.9rem,1.4vw,1rem)]">
            © 2025 SkillSwap · Web Programming Final Project
          </p>
          <p className="text-slate-500 text-[clamp(0.8rem,1.2vw,0.9rem)]">
            National Taiwan Ocean University
          </p>
        </div>
      </section>
    </main>
  );
}
