import { Link } from "react-router-dom";
import { Meteors } from "@/components/UI/meteors";
import { Particles } from "@/components/UI/particles";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth no-scrollbar bg-white">
      {/* ======================================================
          HERO SECTION
         ====================================================== */}
      <section className="relative snap-start min-h-screen w-full overflow-hidden">

        {/* Meteors: Visual Effect */}
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

        {/* Radial Gradient Background */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.12),transparent_60%)]" />

        {/* Content Container */}
        <div className="relative z-30 page-container flex min-h-screen flex-col items-center justify-center text-center px-4">

          {/* Tagline / Project Name */}
          <p className="mb-4 tracking-widest text-slate-500 text-sm font-medium uppercase">
            learning Platform
          </p>

          {/* Main Heading: Brain Barter */}
          <h1
            className="
              mb-6
              font-extrabold
              leading-tight
              text-[clamp(3rem,6vw,5rem)]
              bg-gradient-to-b
              from-slate-900
              via-slate-700
              to-slate-500
              bg-clip-text
              text-transparent
            "
          >
            Brain Barter
          </h1>

          {/* Slogan */}
          <h2 className="mb-8 text-2xl font-semibold text-slate-700 sm:text-3xl">
            Trade what you know for what you need.
          </h2>

          {/* Description (No currency metaphor, pure connection) */}
          <p className="mb-12 max-w-2xl leading-relaxed text-slate-500 text-lg">
            Stop learning alone. Connect with peers to exchange skills, 
            bridge knowledge gaps, and grow together in a trusted environment. 
            Real people, real skills, pure exchange.
          </p>

          {/* CTA Button */}
          <Link to="/explore">
            <button className="rounded-full bg-slate-900 px-10 py-4 text-white font-medium transition-all hover:bg-slate-700 hover:shadow-lg hover:-translate-y-1">
              Start Exploring →
            </button>
          </Link>
        </div>
      </section>

      {/* ======================================================
            ABOUT SECTION
          ====================================================== */}
        <section className="relative snap-start min-h-screen w-full bg-slate-50 overflow-hidden">

          {/* Particles Background */}
          <Particles
            className="absolute inset-0 z-0"
            quantity={140}
            staticity={45}
            ease={55}
            size={0.65}
            color="#475569"   // slate-600
            vx={0.2}
            vy={0.2}
          />
          {/* Content (keep above particles) */}
          <div className="relative z-10 page-container flex min-h-screen items-center px-6">
            <div className="grid w-full gap-16 md:grid-cols-2 items-center">
              
              {/* Text Content */}
              <div className="text-left">
                <h2 className="mb-8 font-bold text-slate-900 text-[clamp(2rem,4vw,3rem)]">
                  About This Platform
                </h2>

                <p className="mb-6 leading-relaxed text-slate-600 text-lg">
                  <strong>Brain Barter</strong> is built on the core philosophy of 
                  mutual learning. We match users based on their interests, skills, 
                  and proficiency levels (High, Mid, Low).
                </p>
                
                <p className="leading-relaxed text-slate-600 text-lg">
                  Our goal is to create a community that values trust and growth, 
                  transforming solitary studying into a collaborative journey.
                </p>
              </div>

              {/* Image / UI Placeholder */}
              <div className="flex items-center justify-center">
                <div
                  className="
                    w-full
                    max-w-xl
                    aspect-[1046/1005]
                    overflow-hidden
                    rounded-2xl
                    bg-slate-900
                    shadow-[0_20px_60px_rgba(15,23,42,0.25)]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <img
                    src="/MatchFound.png"
                    alt="Skill matching result preview"
                    className="
                      h-full
                      w-full
                      object-contain
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


      {/* ======================================================
          FOOTER
         ====================================================== */}
      <footer className="snap-start w-full bg-[#0b0f16] text-white">
        <div className="page-container py-20 px-6">
          <div className="grid gap-12 md:grid-cols-4">

            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="font-bold text-2xl tracking-tight mb-4">
                Brain Barter
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connecting students through skill exchange. 
                Making learning collaborative, effective, and meaningful.
              </p>
            </div>

            {/* Navigation Column */}
            <div>
              <div className="text-slate-200 font-semibold mb-4">Navigation</div>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
                </li>
                <li>
                  <Link to="/match" className="hover:text-white transition-colors">Match</Link>
                </li>
              </ul>
            </div>

            {/* Team Column (Translating Roles) */}
            <div className="md:col-span-2">
              <div className="text-slate-200 font-semibold mb-4">Our Team</div>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <span className="text-slate-300 font-medium block mb-1">
                    01357043 謝侑均
                  </span>
                  <span className="text-slate-500">
                    Frontend Interface, UI / UX Design
                  </span>
                </li>
                <li>
                  <span className="text-slate-300 font-medium block mb-1">
                    01357031 顏家駿
                  </span>
                  <span className="text-slate-500">
                    Backend Development, Algorithm Design
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="mt-16 border-t border-white/10 pt-8 flex flex-col gap-4 md:flex-row md:justify-between items-center text-xs text-slate-500">
            <p>
              © 2025 Brain Barter · Web Programming Final Project
            </p>
            <p>
              National Taiwan Ocean University
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}