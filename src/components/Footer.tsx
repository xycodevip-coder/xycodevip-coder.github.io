import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-background border-t border-white/10 py-8">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-primary rounded-md flex items-center justify-center">
          <span className="font-display font-bold text-white text-xs">XY</span>
        </div>
        <span className="font-display font-bold text-foreground">XY CODE</span>
      </div>
      <div className="flex flex-col items-center md:items-end gap-1">
        <p className="text-muted-foreground text-sm">© 2018 XY CODE. All rights reserved.</p>
      </div>
      <Link to="/admin" className="text-muted-foreground/60 text-xs hover:text-foreground transition-colors">
        Admin
      </Link>
    </div>
  </footer>
);

export default Footer;
