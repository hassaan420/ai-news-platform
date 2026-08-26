import { Link } from 'react-router-dom';
import { Brain, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 border-t border-white/[0.05] bg-transparent backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-sans text-sm font-bold text-white/80 tracking-[0.1em] uppercase">Clarion AI</span>
            </div>
            <p className="text-[12px] text-white/35 max-w-[220px] leading-relaxed">
              AI-powered news intelligence. Discover what matters, without the noise.
            </p>
            <p className="text-[11px] text-white/25">© {year} Clarion AI. All rights reserved.</p>
          </div>

          {/* Navigation columns */}
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div>
              <h4 className="text-[10px] font-semibold text-white uppercase tracking-widest mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/home" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Home</Link></li>
                <li><Link to="/trending" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Trending</Link></li>
                <li><Link to="/search" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Search</Link></li>
                <li><Link to="/saved" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Saved Articles</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-white uppercase tracking-widest mb-3">Categories</h4>
              <ul className="space-y-2">
                <li><Link to="/category/technology" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Technology</Link></li>
                <li><Link to="/category/business" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Business</Link></li>
                <li><Link to="/category/science" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Science</Link></li>
                <li><Link to="/category/health" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Health</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-white uppercase tracking-widest mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="text-[13px] text-white/45 hover:text-white/80 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/20">
            Built with React, TypeScript & AI — powered by a microservices backend
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-7 h-7 rounded-md bg-white/[0.1] hover:bg-white/[0.2] border border-white/[0.05] flex items-center justify-center text-white hover:text-white transition-all" aria-label="GitHub">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-7 h-7 rounded-md bg-white/[0.1] hover:bg-white/[0.2] border border-white/[0.05] flex items-center justify-center text-white hover:text-white transition-all" aria-label="Website">
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
