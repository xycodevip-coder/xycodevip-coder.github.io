import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Tech pattern background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-in max-w-4xl mx-auto">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-6 border border-secondary/20 inline-block px-4 py-1 rounded-full bg-secondary/10 backdrop-blur-md">
            Next Gen Tech Solutions
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight tracking-tight">
            Building the <br /> Future of <span className="text-gradient-primary">Code</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            XY CODE is an Egyptian software company based in the USA, specialized in delivering world-class software solutions and empowering the next generation of developers through elite internship programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-glow transition-all hover:scale-105" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              Discover More <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground w-full sm:w-auto">
                <Shield className="mr-2 w-4 h-4" /> Verify Certificate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
