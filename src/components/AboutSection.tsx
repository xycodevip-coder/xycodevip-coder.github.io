import { Globe, Users, Award, Code } from "lucide-react";

const stats = [
  { icon: Globe, label: "Countries Served", value: "15+" },
  { icon: Users, label: "Students Trained", value: "500+" },
  { icon: Award, label: "Projects Delivered", value: "200+" },
  { icon: Code, label: "Years of Experience", value: "8+" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">About Us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Bridging Cultures Through Technology
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            XY CODE is a premier Egyptian software company based in the USA, specialized in software solutions. We bridge global talent with world-class innovation, combining elite technical expertise with a commitment to education to deliver cutting-edge development services and transformative internship experiences.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-6 text-center shadow-lg border border-border group hover:border-accent transition-colors">
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
