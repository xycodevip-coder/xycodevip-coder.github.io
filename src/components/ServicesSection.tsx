import { Smartphone, Cloud, Database, BarChart3, Lock, Cpu, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "Native and cross-platform mobile apps built with modern frameworks for iOS and Android.",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-500 dark:text-violet-400",
    borderHover: "hover:border-violet-400/40",
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure on AWS, Azure, and GCP with DevOps best practices.",
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-500 dark:text-cyan-400",
    borderHover: "hover:border-cyan-400/40",
  },
  {
    icon: Database,
    title: "Data Engineering",
    description: "Robust data pipelines, warehousing, and analytics solutions for data-driven decisions.",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-400/40",
  },
  {
    icon: BarChart3,
    title: "AI & Analytics",
    description: "Machine learning models and business intelligence dashboards that drive growth.",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-500 dark:text-orange-400",
    borderHover: "hover:border-orange-400/40",
  },
  {
    icon: Lock,
    title: "Cybersecurity",
    description: "Security audits, penetration testing, and compliance consulting to protect your assets.",
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-500 dark:text-rose-400",
    borderHover: "hover:border-rose-400/40",
  },
  {
    icon: Cpu,
    title: "Custom Software",
    description: "Bespoke software solutions tailored precisely to your unique business requirements.",
    gradient: "from-indigo-500/20 to-blue-500/10",
    iconColor: "text-indigo-500 dark:text-indigo-400",
    borderHover: "hover:border-indigo-400/40",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-muted/30 pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--secondary)), transparent)" }}
      />

      {/* Decorative orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] orb orb-primary opacity-20 pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 badge-glass text-secondary mb-6">
            <span>Our Expertise</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Services We{" "}
            <span className="text-gradient-cyan">Offer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            As an Egyptian software company based in the USA, we specialize in comprehensive software
            solutions to help businesses thrive in the digital age.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className={`glass-card p-8 group cursor-default border border-border/50 transition-all duration-300 ${s.borderHover} hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className={`w-7 h-7 ${s.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {s.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {s.description}
              </p>

              {/* Learn more */}
              <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
