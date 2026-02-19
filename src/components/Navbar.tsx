import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "About", action: () => scrollTo("about") },
    { label: "Services", action: () => scrollTo("services") },
    { label: "Tech Stack", action: () => scrollTo("techstack") },
    { label: "Contact", action: () => scrollTo("contact") },
  ];

  const navLinkClass =
    "relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg group";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-nav shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-80 group-hover:opacity-100 transition-opacity shadow-glow" />
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm tracking-tight">XY</span>
            </div>
          </div>
          <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
            XY CODE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className={navLinkClass}
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-primary rounded-full group-hover:w-5 transition-all duration-300" />
            </button>
          ))}
          <Link to="/internships" className={navLinkClass}>
            Internships
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-primary rounded-full group-hover:w-5 transition-all duration-300" />
          </Link>
          <Link to="/task-submission" className={navLinkClass}>
            Submit Task
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-primary rounded-full group-hover:w-5 transition-all duration-300" />
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          <Link to="/verify">
            <Button
              size="sm"
              className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Verify Certificate
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button
            className="w-9 h-9 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="glass-strong mx-4 mb-4 rounded-2xl p-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 rounded-xl"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/internships"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 rounded-xl"
          >
            Internships
          </Link>
          <Link
            to="/task-submission"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 rounded-xl"
          >
            Submit Task
          </Link>
          <div className="pt-2 border-t border-border/40">
            <Link to="/verify" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-gradient-primary text-white border-0 shadow-glow font-semibold hover:opacity-90 transition-opacity">
                <Shield className="w-4 h-4 mr-1.5" />
                Verify Certificate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
