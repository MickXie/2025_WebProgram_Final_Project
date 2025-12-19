import { Link } from "react-router-dom";
import { Meteors } from "@/components/ui/meteors";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth no-scrollbar bg-white">
      <section className="relative snap-start min-h-screen w-full overflow-hidden">

        {/* Meteors：放在文字「上方」 */}
        <div className="pointer-events-none absolute inset-0 z-20 w-full overflow-hidden">
          <Meteors
            number={30}
            minDelay={0.3}
            maxDelay={1.4}
            minDuration={2.5}
            maxDuration={9.5}
            angle={215}
            className="
              text-blue-300
              opacity-60
              mix-blend-screen
              shadow-[0_0_0_1px_rgba(255,255,255,0.12)]
            "
          />
        </div>

        {/* 淡光暈（在流星下面一層） */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.12),transparent_60%)]" />

        {/* 文字內容：不要用實心遮擋 */}
        <div className="relative z-30 page-container flex min-h-screen flex-col items-center justify-center text-center">

          <p className="mb-4 tracking-widest text-slate-500 text-sm">
            SKILLSWAP PLATFORM
          </p>

          {/* ⭐ 關鍵：文字改成可「透過」 */}
          <h1
            className="
              mb-6
              font-semibold
              leading-tight
              text-[clamp(2.6rem,5vw,4.2rem)]
              bg-gradient-to-b
              from-slate-900
              via-slate-700
              to-slate-500
              bg-clip-text
              text-transparent
            "
          >
            讓學習不再孤單
            <br />
            <span className="opacity-80">
              讓專長找到真正的價值
            </span>
          </h1>

          <p className="mb-12 max-w-2xl leading-relaxed text-slate-500">
            透過興趣標籤與技能配對，在安全的環境中找到你的學習夥伴，
            讓知識交換變得自然且有溫度。
          </p>

          <Link to="/explore">
            <button className="rounded-md bg-blue-600 px-8 py-4 text-white transition hover:bg-blue-700">
              開始探索 →
            </button>
          </Link>
        </div>
      </section>

      {/* ======================================================
         ABOUT — 滿版區塊 + 中央欄位
         ====================================================== */}
      <section className="snap-start min-h-screen w-full bg-white">
        <div className="page-container flex min-h-screen items-center">
          <div className="grid w-full gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-10 font-semibold text-slate-900 text-[clamp(1.8rem,3.5vw,2.6rem)]">
                關於技能交換平台
              </h2>

              <p className="leading-relaxed text-slate-600 text-[clamp(1rem,1.6vw,1.15rem)]">
                本平台以「技能交換」為核心，讓使用者依據興趣、技能與背景進行配對，
                打造一個重視信任、互助與成長的學習社群。
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="h-[420px] w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                圖片 / UI 展示區
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
         FOOTER — 原神風（滿版深色）
         ====================================================== */}
      <footer className="snap-start w-full bg-[#0b0f16]">
        <div className="page-container py-14">
          <div className="grid gap-10 md:grid-cols-4">

            {/* 品牌說明 */}
            <div>
              <div className="text-white font-semibold text-lg">
                SkillSwap
              </div>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                以技能交換連結彼此，讓學習更安全、更有效、更有溫度。
              </p>
            </div>

            {/* 導覽 */}
            <div>
              <div className="text-slate-200 font-medium mb-3">導覽</div>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-white">首頁</Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-white">探索</Link>
                </li>
                <li>
                  <Link to="/match" className="hover:text-white">配對</Link>
                </li>
              </ul>
            </div>

            {/* 我們的團隊 */}
            <div className="md:col-span-2">
              <div className="text-slate-200 font-medium mb-3">我們的團隊</div>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <span className="text-slate-300 font-medium">
                    01357043 謝侑均
                  </span>{" "}
                  — 前端介面、UI / UX 設計
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    01357031 顏家駿
                  </span>{" "}
                  — 後端開發、演算法設計
                </li>
              </ul>
            </div>

          </div>

          {/* 底線 */}
          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-2 md:flex-row md:justify-between">
            <p className="text-slate-500 text-sm">
              © 2025 SkillSwap · Web Programming Final Project
            </p>
            <p className="text-slate-500 text-sm">
              National Taiwan Ocean University
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
