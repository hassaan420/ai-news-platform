import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, Brain, Globe, Database, Network,
  Cpu, Layers, Shield, TrendingUp, Sparkles, Server, Combine, ChevronRight
} from 'lucide-react';
import { ShaderBackground } from '@/components/ui/shader-foda-rosa';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 }
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-primary/30">

      {/* Floating Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/10 backdrop-blur-md border-b border-white/[0.05]"
      >
        <div className="flex items-center gap-3 group cursor-pointer select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.12] border border-white/[0.2] shadow-lg backdrop-blur-md overflow-hidden group-hover:bg-white/[0.18] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <svg className="w-5 h-5 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C16.8 5.5 14.5 4 12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C14.5 20 16.8 18.5 18 16" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3.5" fill="white" />
            </svg>
          </div>
          <span className="font-sans font-extrabold tracking-[0.2em] uppercase text-xl md:text-2xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            Clarion
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/95 drop-shadow-md">
          <a href="#problem" className="hover:text-white transition-colors duration-200">The Problem</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
          <a href="#benefits" className="hover:text-white transition-colors duration-200">Benefits</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white/95 hover:text-white transition-colors duration-200 drop-shadow-md">Log In</Link>
          <Link to="/register" className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full shadow-lg hover:-translate-y-[2px] active:translate-y-0 transition-transform duration-200">Get Started</Link>
        </div>
      </motion.nav>

      <main className="relative z-10 pt-32">

        {/* SECTION 1: HERO — with ambient rose glow */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">

          {/* Ambient rose/pink glow orbs — pure CSS, performant */}
          <div className="ambient-rose-hero" aria-hidden="true" />

          {/* Additional warm orb lower-left */}
          <div
            className="absolute bottom-0 left-1/4 w-[500px] h-[500px] pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at 40% 60%, rgba(160, 40, 90, 0.07) 0%, transparent 65%)',
              filter: 'blur(60px)',
              borderRadius: '50%',
            }}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto relative z-10"
          >
            {/* Eyebrow badge */}
            <motion.div variants={fadeUp} className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.15] border border-white/[0.1] text-xs font-bold tracking-widest uppercase text-white shadow-lg backdrop-blur-md">
                <Brain className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                AI-Powered News Intelligence
              </div>
            </motion.div>

            {/* Hero headline — editorial serif, strong contrast */}
            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.08] mb-8 text-white"
              style={{ textShadow: '0 5px 30px rgba(0,0,0,0.6)' }}
            >
              The world is loud.{' '}
              <br />
              <span className="text-white/95 drop-shadow-lg">Your news doesn't have to be.</span>
            </motion.h1>

            {/* Supporting description — improved contrast */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-lg"
            >
              An intelligent platform that discovers, organizes, and personalizes the stories that matter.
              Escape the noise of modern media.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-base hover:-translate-y-[2px] active:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2"
              >
                Start Reading <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#problem"
                className="w-full sm:w-auto px-8 py-4 bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] text-white/85 rounded-full font-medium text-base hover:bg-white/[0.1] hover:text-white transition-colors duration-200 flex items-center justify-center"
              >
                Explore How It Works
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 2: THE PROBLEM */}
        <section id="problem" className="py-32 px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.div variants={fadeUp} className="label-section mb-4 drop-shadow-md">The Problem</motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-4xl md:text-5xl font-bold leading-[1.12] mb-6 text-white drop-shadow-xl"
              >
                There is more news than ever.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg text-white/90 leading-relaxed font-medium drop-shadow-lg"
              >
                Thousands of sources. Millions of articles. Endless duplication. Finding what actually matters
                is becoming harder every day. You're drowning in information, but starving for context.
              </motion.p>
            </div>

            {/* Visual: Chaotic fan-out of article cards */}
            <div className="relative h-[480px] w-full flex items-center justify-end pr-8 md:pr-16">
              {[
                { source: "TechCrunch", title: "Global AI Regulations Loom Over Startups", time: "1h ago", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop" },
                { source: "Wired", title: "The Next Era of Neural Networks", time: "2h ago", img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=200&auto=format&fit=crop" },
                { source: "The Verge", title: "Are Self-Driving Cars Finally Ready?", time: "3h ago", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200&auto=format&fit=crop" },
                { source: "Forbes", title: "Startups Navigating the Bear Market", time: "5h ago", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=200&auto=format&fit=crop" },
                { source: "Bloomberg", title: "Markets Rally on Big Tech Earnings", time: "6h ago", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=200&auto=format&fit=crop" },
              ].map((article, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 120, y: 100, rotate: 15, scale: 0.7 }}
                  whileInView={{ 
                    opacity: 1 - (i * 0.12), 
                    x: -i * 20, 
                    y: (i - 2) * 35, 
                    rotate: (i - 2) * -6, 
                    scale: 1 - (i * 0.06) 
                  }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.15 }}
                  className="absolute w-72 md:w-[340px] bg-white/[0.12] backdrop-blur-2xl border border-white/[0.2] p-3.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4"
                  style={{ zIndex: 10 - i }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-inner ring-1 ring-white/10">
                    <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold tracking-wider text-white/70 uppercase mb-1 flex justify-between drop-shadow-md">
                      <span>{article.source}</span>
                      <span>{article.time}</span>
                    </div>
                    <h4 className="text-white font-semibold text-sm leading-snug drop-shadow-md">
                      {article.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECTION 3: THE SOLUTION */}
        <section className="py-32 px-6 bg-white/[0.15] backdrop-blur-xl border-y border-white/[0.1] relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-15%" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="label-section mb-4 text-center drop-shadow-md">The Solution</motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl md:text-5xl font-bold leading-[1.15] mb-16 text-white drop-shadow-xl"
            >
              One place.<br />
              <span className="text-white/90">Every important story.</span><br />
              Organized intelligently.
            </motion.h2>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
            >
              {[
                { title: "Curated by AI", desc: "Our engine analyzes thousands of articles globally to find the highest quality reporting.", icon: Brain },
                { title: "Personalized", desc: "The system learns what matters to you, surfacing relevant context for your industry.", icon: Sparkles },
                { title: "Clean Design", desc: "A glass interface that puts typography and readability first.", icon: Layers }
              ].map((feature, i) => (
                <div key={i} className="group bg-white/[0.12] backdrop-blur-3xl border border-white/[0.2] p-8 rounded-3xl hover:-translate-y-2 hover:bg-white/[0.18] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] shadow-xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="relative z-10 font-serif text-2xl font-bold mb-3 text-white drop-shadow-md">{feature.title}</h3>
                  <p className="relative z-10 text-white/95 text-sm leading-relaxed font-medium drop-shadow-md">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

          {/* SECTION 4: INTELLIGENCE PIPELINE */}
          <section id="how-it-works" className="py-36 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                <div className="label-section mb-3 drop-shadow-md">How It Works</div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-5 text-white drop-shadow-xl">The Intelligence Pipeline</h2>
                <p className="text-lg text-white/95 font-medium max-w-xl mx-auto drop-shadow-lg">How raw global data becomes your personalized news feed.</p>
              </div>

              <div className="relative">
                {/* Flowing track line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/[0.15] transform md:-translate-x-1/2 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <motion.div
                    className="w-full absolute top-0 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_25px_rgba(255,255,255,1)]"
                    style={{ height: '30vh' }}
                    animate={{ top: ['-30%', '130%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                {[
                  { step: "01 — Collection", title: "Global Sources", desc: "Aggregating real-time data from verified global publishers.", icon: Globe },
                  { step: "02 — Processing", title: "Duplicate Detection", desc: "Identifying identical stories and merging them to reduce noise.", icon: Combine },
                  { step: "03 — Analysis", title: "AI Categorization", desc: "Neural networks analyze sentiment, topic, and relevance.", icon: Brain },
                  { step: "04 — Delivery", title: "Personalized Feed", desc: "The recommendation engine matches stories to your unique graph.", icon: Sparkles }
                ].map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`flex flex-col md:flex-row items-center justify-between mb-24 relative group ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="w-full md:w-5/12 mb-8 md:mb-0 hidden md:block"></div>

                    {/* Center node */}
                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.3] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center z-10 group-hover:scale-110 transition-all duration-300 group-hover:border-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                      <stage.icon className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    <div className={`w-full md:w-5/12 pl-24 md:pl-0 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                      <div className="text-[11px] font-bold tracking-[0.2em] text-white/80 uppercase mb-3 drop-shadow-md">{stage.step}</div>
                      <h3 className="font-serif text-3xl font-bold mb-4 text-white drop-shadow-lg group-hover:text-white/90 transition-colors">{stage.title}</h3>
                      <p className="text-white/95 leading-relaxed font-medium text-base drop-shadow-md">{stage.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        {/* SECTION 5: PERSONALIZATION */}
        <section className="py-32 px-6 bg-white/[0.15] backdrop-blur-xl border-y border-white/[0.1]">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-15%" }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2"
            >
              <div className="label-section mb-4 drop-shadow-md">Personalization</div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-[1.12] mb-6 text-white drop-shadow-xl">
                The more you read,<br />
                <span className="text-white/90">the more relevant your world becomes.</span>
              </h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed font-medium drop-shadow-lg">
                Our recommendation engine doesn't just look at clicks. It analyzes reading depth, topic clusters,
                and semantic relationships to build a sophisticated graph of your actual interests.
              </p>
              <div className="space-y-4">
                {['Your Interests', 'Reading Signals', 'Article Features'].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex items-center gap-4 bg-white/[0.12] border border-white/[0.15] p-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner">
                      <div className="absolute inset-0 rounded-full border border-white/40 animate-[spin_4s_linear_infinite]"></div>
                      +
                    </div>
                    <span className="font-medium text-white drop-shadow-sm z-10">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2 relative w-full h-[480px] flex items-center justify-center"
            >
              {/* Animated Background Orb */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-full blur-3xl"
              ></motion.div>
              
              {/* Floating Decorative Tags */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 -left-8 z-20 bg-black/60 backdrop-blur-xl border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl"
              >
                Neural Clusters
              </motion.div>
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 -right-6 z-20 bg-black/60 backdrop-blur-xl border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl"
              >
                Semantic Matching
              </motion.div>

              {/* Main Glass Card */}
              <div className="relative z-10 w-full max-w-sm bg-white/[0.15] backdrop-blur-3xl border border-white/[0.25] rounded-3xl p-7 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between mb-6 border-b border-white/[0.2] pb-5">
                  <div className="flex items-center gap-2 text-white font-bold text-sm drop-shadow-md">
                    <Sparkles className="w-5 h-5 text-white/90" /> Recommended for You
                  </div>
                </div>
                <div className="space-y-6">
                  {[
                    { source: "Nature", title: "Quantum Computing Breakthroughs in 2026", time: "2h ago", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=150&auto=format&fit=crop" },
                    { source: "Financial Times", title: "Central Banks Shift Policy on Digital Currencies", time: "4h ago", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=150&auto=format&fit=crop" },
                    { source: "MIT Tech Review", title: "Solid-State Batteries Hit Production Milestones", time: "5h ago", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=150&auto=format&fit=crop" },
                  ].map((article, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex gap-4 items-center group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg ring-1 ring-white/20 relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold tracking-wider text-white/80 uppercase mb-1 drop-shadow-md">
                          {article.source} • {article.time}
                        </div>
                        <h4 className="text-white font-semibold text-sm leading-snug drop-shadow-md group-hover:text-white/80 transition-colors">
                          {article.title}
                        </h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 6: SMART SEARCH */}
        <section className="py-36 px-6 text-center max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="label-section mb-4 text-center drop-shadow-md">Intelligent Search</motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl font-bold mb-12 text-white drop-shadow-xl"
            >
              Looking for something?
            </motion.h2>
            <motion.div variants={fadeUp} className="relative group mx-auto max-w-2xl">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
              <div className="relative bg-white/[0.18] backdrop-blur-2xl border border-white/[0.25] rounded-full p-2 flex items-center shadow-2xl">
                <Search className="w-5 h-5 text-white ml-4 mr-3 drop-shadow-md" />
                <div className="flex-1 text-left text-white/90 font-medium text-base px-2 drop-shadow-md">Artificial Intelligence in Healthcare</div>
                <div className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm shadow-md">Search</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 7: DUPLICATE DETECTION */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2 w-full"
            >
              <div className="relative w-full max-w-[420px] h-[320px] mx-auto">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.1, type: "spring" }}
                  className="absolute left-0 top-4 w-32 h-14 bg-white/[0.15] backdrop-blur-xl border border-white/[0.25] rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                >Source A</motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.3, type: "spring" }}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-32 h-14 bg-white/[0.15] backdrop-blur-xl border border-white/[0.25] rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                >Source B</motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.5, type: "spring" }}
                  className="absolute left-0 bottom-4 w-32 h-14 bg-white/[0.15] backdrop-blur-xl border border-white/[0.25] rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                >Source C</motion.div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 420 320" style={{ zIndex: -1 }}>
                  {/* Top line to Center */}
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: false }} transition={{ delay: 0.6, duration: 0.8 }}
                    d="M 128 44 C 180 44, 180 160, 220 160" stroke="rgba(255,255,255,0.6)" fill="none" strokeWidth="2" strokeDasharray="5 5"
                  />
                  {/* Middle line to Center */}
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: false }} transition={{ delay: 0.7, duration: 0.8 }}
                    d="M 128 160 L 220 160" stroke="rgba(255,255,255,0.6)" fill="none" strokeWidth="2" strokeDasharray="5 5"
                  />
                  {/* Bottom line to Center */}
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: false }} transition={{ delay: 0.8, duration: 0.8 }}
                    d="M 128 276 C 180 276, 180 160, 220 160" stroke="rgba(255,255,255,0.6)" fill="none" strokeWidth="2" strokeDasharray="5 5"
                  />
                </svg>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} transition={{ delay: 1.2, type: "spring", bounce: 0.4 }}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-48 h-20 bg-white/[0.25] backdrop-blur-3xl border border-white/40 rounded-2xl flex items-center justify-center text-base font-bold text-white shadow-[0_20px_40px_rgba(0,0,0,0.4)] drop-shadow-md z-10 ring-2 ring-white/20"
                >
                  <Sparkles className="w-5 h-5 mr-2 text-white animate-pulse" />
                  One Clean Story
                </motion.div>
              </div>
            </motion.div>
            <div className="md:w-1/2">
              <div className="label-section mb-4 drop-shadow-md">Deduplication</div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5 text-white drop-shadow-xl">End the repetition.</h2>
              <p className="text-lg text-white/95 leading-relaxed font-medium drop-shadow-lg">
                When a major event happens, thousands of outlets report the exact same story. Our duplicate detection
                engine clusters similar coverage, presenting you with the highest quality source.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8: USER BENEFITS */}
        <section id="benefits" className="py-32 px-6 bg-white/[0.15] backdrop-blur-xl border-t border-white/[0.1]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="label-section mb-3 drop-shadow-md">The Clarion Advantage</div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-xl">News that respects your time.</h2>
              <p className="text-lg text-white/95 font-medium drop-shadow-md max-w-2xl mx-auto">
                Designed to help you cut through the noise, understand complex topics, and stay ahead in your industry without endless scrolling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { name: "Zero Clutter", desc: "No ads, no clickbait, no infinite scrolling. Just pure information.", icon: Shield },
                { name: "Deep Context", desc: "Understand the 'why' behind the headlines with AI summaries.", icon: Brain },
                { name: "Real-Time Edge", desc: "Get critical industry updates the moment they break globally.", icon: TrendingUp },
                { name: "Unbiased View", desc: "Read multiple perspectives automatically gathered in one place.", icon: Combine }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="bg-white/[0.12] backdrop-blur-3xl border border-white/[0.2] p-8 rounded-3xl hover:-translate-y-2 hover:bg-white/[0.18] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] shadow-xl transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <benefit.icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-3 drop-shadow-md relative z-10">{benefit.name}</h3>
                  <p className="text-sm text-white/95 font-medium leading-relaxed drop-shadow-md relative z-10">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL CTA — with rose glow */}
        <section className="py-40 px-6 text-center relative overflow-hidden">
          {/* Rose ambient glow for CTA */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-10 text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
              The world won't slow down. <br />
              <span className="text-white/95 drop-shadow-lg">Your news experience can get smarter.</span>
            </h2>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:-translate-y-[2px] active:translate-y-0 transition-transform duration-200"
            >
              Enter Platform <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-white/70 font-medium text-sm border-t border-white/[0.15]">
          <p>© {new Date().getFullYear()} Clarion Intelligence. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
