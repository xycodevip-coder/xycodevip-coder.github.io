import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Star, CheckCircle2, ArrowRight, Trophy, Zap } from "lucide-react";

const benefits = [
  "Hands-on experience with real projects",
  "Mentorship from senior engineers",
  "Certificate of completion upon finishing",
  "Flexible remote-first program",
  "Exposure to US tech industry standards",
  "Portfolio-ready project work",
];

const cards = [
  {
    icon: GraduationCap,
    title: "Learn",
    desc: "Industry-standard tools and practices",
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "from-cyan-500/15 to-cyan-500/5",
    border: "hover:border-cyan-400/40",
  },
  {
    icon: Briefcase,
    title: "Build",
    desc: "Real projects for real clients",
    color: "text-violet-500 dark:text-violet-400",
    bg: "from-violet-500/15 to-violet-500/5",
    border: "hover:border-violet-400/40",
  },
  {
    icon: Star,
    title: "Grow",
    desc: "Develop your professional network",
    color: "text-rose-500 dark:text-rose-400",
    bg: "from-rose-500/15 to-rose-500/5",
    border: "hover:border-rose-400/40",
  },
];

const InternshipSection = () => {
  return (
    <section id="internship" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent)), transparent)" }}
      />

      {/* Decorative orb */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] orb orb-accent opacity-15 pointer-events-none" />

      <div className="relative container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 badge-glass text-accent mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>Internship Program</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Launch Your{" "}
              <span className="text-gradient-primary">Tech Career</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our internship program is designed for students and early-career professionals looking to
              gain real-world experience in software development. Work alongside experienced engineers
              on production-level projects.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-foreground/80 text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>

            <Link to="/internships#apply-form">
              <Button
                size="lg"
                className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-300 font-semibold px-8 h-12"
              >
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Right Cards */}
          <div className="grid grid-cols-2 gap-5">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={`glass-card p-6 group cursor-default border border-border/50 transition-all duration-300 ${card.border} hover:-translate-y-1 ${i === 1 ? "mt-8" : ""}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h4 className="font-display font-bold text-foreground text-lg mb-1">{card.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}

            {/* Highlight card */}
            <div className="glass-card mt-8 p-6 relative overflow-hidden cursor-default border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <Trophy className="w-8 h-8 text-amber-500 dark:text-yellow-400 mb-3" />
              <p className="font-display text-4xl font-bold text-gradient-primary">100%</p>
              <p className="text-foreground/60 text-sm mt-1 font-medium">of interns receive certificates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternshipSection;
