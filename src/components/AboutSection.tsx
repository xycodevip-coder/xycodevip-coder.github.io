import { Globe, Users, Award, Code, Zap } from "lucide-react";

const stats = [
  { icon: Globe, label: "Countries Served", value: "15+", color: "text-cyan-500 dark:text-cyan-400", bg: "from-cyan-500/15 to-cyan-500/5", border: "hover:border-cyan-400/40" },
  { icon: Users, label: "Students Trained", value: "500+", color: "text-violet-500 dark:text-violet-400", bg: "from-violet-500/15 to-violet-500/5", border: "hover:border-violet-400/40" },
  { icon: Award, label: "Projects Delivered", value: "200+", color: "text-rose-500 dark:text-rose-400", bg: "from-rose-500/15 to-rose-500/5", border: "hover:border-rose-400/40" },
  { icon: Code, label: "Years of Experience", value: "8+", color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-500/15 to-emerald-500/5", border: "hover:border-emerald-400/40" },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
      />

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 badge-glass text-accent mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>About Us</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Bridging Cultures Through{" "}
            <span className="text-gradient-primary">Technology</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            XY CODE is a premier Egyptian software company based in the USA, specialized in software solutions.
            We bridge global talent with world-class innovation, combining elite technical expertise with a
            commitment to education to deliver cutting-edge development services and transformative internship experiences.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`glass-card p-6 text-center group cursor-default border border-border/50 transition-all duration-300 ${stat.border} hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              {/* Value */}
              <p className={`font-display text-4xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              {/* Label */}
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom feature row */}
        <div className="mt-16 glass-card p-8 md:p-10 border border-border/50">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "Global Reach",
                desc: "Serving clients across 15+ countries with tailored software solutions that meet international standards.",
              },
              {
                title: "Elite Talent",
                desc: "Our team consists of senior engineers with expertise across mobile, cloud, AI, and cybersecurity domains.",
              },
              {
                title: "Education First",
                desc: "We invest in the next generation through structured internship programs with real-world project exposure.",
              },
            ].map((item, i) => (
              <div key={item.title} className={`${i < 2 ? "md:border-r border-border/40" : ""} px-4`}>
                <h3 className="font-display font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
