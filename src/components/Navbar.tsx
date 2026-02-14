import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-md flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">XY</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">XY CODE</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</button>
          <button onClick={() => scrollTo("services")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</button>
          <button onClick={() => scrollTo("services")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</button>
          <Link to="/internships" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Internships</Link>
          <button onClick={() => scrollTo("contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          <ModeToggle />
          <Link to="/verify">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Shield className="w-4 h-4 mr-1" /> Verify Certificate
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button className="text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4 space-y-3 shadow-lg">
          <button onClick={() => scrollTo("about")} className="block text-sm text-foreground/80 hover:text-foreground py-2 w-full text-left">About</button>
          <button onClick={() => scrollTo("services")} className="block text-sm text-foreground/80 hover:text-foreground py-2 w-full text-left">Services</button>
          <Link to="/internships" onClick={() => setIsOpen(false)} className="block text-sm text-foreground/80 hover:text-foreground py-2 w-full text-left">Internships</Link>
          <button onClick={() => scrollTo("contact")} className="block text-sm text-foreground/80 hover:text-foreground py-2 w-full text-left">Contact</button>
          <Link to="/verify" onClick={() => setIsOpen(false)}>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
              <Shield className="w-4 h-4 mr-1" /> Verify Certificate
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
