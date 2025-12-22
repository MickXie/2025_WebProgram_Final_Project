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
              {/* Project Links */}
                <div className="mt-8 flex items-center gap-6 text-slate-500">

                  {/* Project Slides */}
                  <a
                    href="https://www.canva.com/design/DAG8KnboN-8/o7b_IT24woq4nuf4f5Jyrw/edit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 transition-colors hover:text-slate-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white transition-all group-hover:border-slate-900">
                      {/* PPT / Slides Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6h-2v6H4V4h6V2H4z" />
                        <path d="M14 2v6h6" />
                        <path d="M13 13h8v-2h-8v2zm0 4h8v-2h-8v2z" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium">Project Slides</span>
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/MickXie/2025_WebProgram_Final_Project.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 transition-colors hover:text-slate-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white transition-all group-hover:border-slate-900">
                      {/* GitHub Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M12 .5C5.65.5.5 5.82.5 12.38c0 5.25 3.44 9.7 8.21 11.27.6.11.82-.27.82-.59v-2.24c-3.34.75-4.04-1.64-4.04-1.64-.55-1.43-1.35-1.81-1.35-1.81-1.1-.77.08-.75.08-.75 1.22.09 1.86 1.29 1.86 1.29 1.08 1.9 2.83 1.35 3.52 1.03.11-.81.42-1.35.76-1.66-2.66-.31-5.46-1.37-5.46-6.09 0-1.35.47-2.45 1.24-3.31-.13-.31-.54-1.55.12-3.23 0 0 1.01-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.66 1.68.25 2.92.12 3.23.77.86 1.24 1.96 1.24 3.31 0 4.74-2.8 5.77-5.47 6.08.43.38.81 1.12.81 2.26v3.35c0 .33.22.71.83.59 4.77-1.57 8.2-6.02 8.2-11.27C23.5 5.82 18.35.5 12 .5z" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium">GitHub</span>
                  </a>

                </div>

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