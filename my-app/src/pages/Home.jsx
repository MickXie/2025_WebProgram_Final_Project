import { Link } from "react-router-dom";
import { Meteors } from "@/components/ui/meteors";

export default function Home() {
  return (
    <>
      {/* ===== Hero Header with Meteors (Tailwind v4 + Magic UI v4) ===== */}
      <header className="relative h-[500px] w-full overflow-hidden bg-black">
        {/* Meteors background */}
        <Meteors
          number={24}
          minDelay={0.2}
          maxDelay={1.2}
          minDuration={2}
          maxDuration={10}
          angle={215}
        />

        {/* Foreground content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold">
            讓學習不再孤單，讓專長找到價值
          </h1>

          <p className="mb-6 max-w-2xl text-lg opacity-90">
            透過興趣標籤與技能配對，找到你的最佳學習夥伴。
          </p>

          <Link to="/explore">
            <button className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200">
              開始尋找夥伴
            </button>
          </Link>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="px-6 py-12">
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold">為什麼選擇我們？</h2>
          <p className="leading-relaxed">
            1. 使用學號跟姓名註冊
            <br />
            2. 智慧演算法配對
            <br />
            3. 實時聊天互動
          </p>
        </section>
      </main>
    </>
  );
}
