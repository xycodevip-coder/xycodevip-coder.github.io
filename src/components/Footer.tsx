import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";
import logoImg from "@/assets/logo-transparent.png";

const Footer = () => (
  <footer className="relative border-t border-border/40 overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-background pointer-events-none" />

    <div className="relative container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo & tagline */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="XY CODE" className="w-9 h-9 object-contain" />
            <span className="font-display font-bold text-foreground text-lg">XY CODE</span>
          </div>
          <p className="text-muted-foreground text-xs max-w-xs text-center md:text-left leading-relaxed">
            Egyptian software company based in the USA, delivering world-class tech solutions.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {[
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Internships", href: "/internships" },
            { label: "Verify Certificate", href: "/verify" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          {[
            { icon: Github, href: "#", label: "GitHub" },
            { icon: Twitter, href: "#", label: "Twitter" },
            { icon: Linkedin, href: "#", label: "LinkedIn" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="w-9 h-9 glass rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary border border-border/40 hover:border-primary/30 transition-all duration-200"
            >
              <social.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} XY CODE. All rights reserved.
        </p>
        <Link
          to="/admin"
          className="text-muted-foreground/40 text-xs hover:text-muted-foreground transition-colors duration-200 flex items-center gap-1"
        >
          Admin
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
