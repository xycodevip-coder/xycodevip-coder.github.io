import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Star, CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
  "Hands-on experience with real projects",
  "Mentorship from senior engineers",
  "Certificate of completion upon finishing",
  "Flexible remote-first program",
  "Exposure to US tech industry standards",
  "Portfolio-ready project work",
];

const InternshipSection = () => {
  return (
    <section id="internship" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">Internship Program</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Launch Your Tech Career
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our internship program is designed for students and early-career professionals looking to gain real-world experience in software development. Work alongside experienced engineers on production-level projects.
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/internships#apply-form">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-glow">
                Apply Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
              <GraduationCap className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-display font-bold text-foreground text-lg mb-1">Learn</h4>
              <p className="text-muted-foreground text-sm">Industry-standard tools and practices</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-lg mt-8">
              <Briefcase className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-display font-bold text-foreground text-lg mb-1">Build</h4>
              <p className="text-muted-foreground text-sm">Real projects for real clients</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
              <Star className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-display font-bold text-foreground text-lg mb-1">Grow</h4>
              <p className="text-muted-foreground text-sm">Develop your professional network</p>
            </div>
            <div className="bg-primary rounded-lg p-6 mt-8">
              <p className="text-accent font-display text-3xl font-bold">100%</p>
              <p className="text-primary-foreground/70 text-sm mt-1">of interns receive certificates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternshipSection;
