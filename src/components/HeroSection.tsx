import { Link } from "react-router-dom";
import { ArrowRight, Shield, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Tech pattern background"
          className="w-full h-full object-cover opacity-10 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb orb-primary w-[600px] h-[600px] -top-40 -left-40 animate-orb-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="orb orb-accent w-[500px] h-[500px] top-1/3 -right-32 animate-orb-float"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="orb orb-cyan w-[400px] h-[400px] bottom-0 left-1/3 animate-orb-float"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <div className="animate-fade-in max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-glass text-secondary mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Gen Tech Solutions</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-[1.05] tracking-tight">
            Building the{" "}
            <br className="hidden sm:block" />
            Future of{" "}
            <span className="text-gradient-primary relative inline-block">
              Code
              {/* Underline glow */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-primary rounded-full opacity-60 blur-sm" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            XY CODE is an Egyptian software company based in the USA, specialized in delivering
            world-class software solutions and empowering the next generation of developers through
            elite internship programs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-primary text-white border-0 shadow-glow hover:shadow-glow-accent hover:scale-105 transition-all duration-300 font-semibold px-8 h-12 text-base"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              Discover More
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link to="/verify">
              <Button
                size="lg"
                variant="outline"
                className="glass border-white/20 hover:bg-white/10 text-foreground hover:text-primary transition-all duration-300 font-semibold px-8 h-12 text-base w-full sm:w-auto hover:scale-105 hover:border-primary/40"
              >
                <Shield className="mr-2 w-5 h-5" />
                Verify Certificate
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "500+", label: "Students Trained" },
              { value: "200+", label: "Projects Delivered" },
              { value: "15+", label: "Countries Served" },
              { value: "8+", label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors animate-bounce"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          aria-label="Scroll down"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
