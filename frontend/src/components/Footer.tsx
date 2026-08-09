import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-8 flex flex-col md:flex-row justify-between items-center px-margin_mobile md:px-margin_desktop mt-16 border-t border-border/30">
      <div className="mb-4 md:mb-0 text-center md:text-left">
        <span className="font-display-lg text-[20px] text-primary tracking-tight">Clarion</span>
        <p className="font-metadata text-[12px] text-muted-foreground mt-1">© {year} Clarion AI. All rights reserved.</p>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link to="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
        <Link to="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        <Link to="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">About</Link>
      </div>
    </footer>
  );
}
