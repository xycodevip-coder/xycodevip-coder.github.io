import { Smartphone, Cloud, Database, BarChart3, Lock, Cpu } from "lucide-react";

const services = [
  { icon: Smartphone, title: "Mobile Development", description: "Native and cross-platform mobile apps built with modern frameworks." },
  { icon: Cloud, title: "Cloud Solutions", description: "Scalable cloud infrastructure on AWS, Azure, and GCP." },
  { icon: Database, title: "Data Engineering", description: "Data pipelines, warehousing, and analytics solutions." },
  { icon: BarChart3, title: "AI & Analytics", description: "Machine learning models and business intelligence dashboards." },
  { icon: Lock, title: "Cybersecurity", description: "Security audits, penetration testing, and compliance consulting." },
  { icon: Cpu, title: "Custom Software", description: "Bespoke software solutions tailored to your business needs." },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Our Expertise</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Services We Offer
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            As an Egyptian software company based in the USA, we specialize in comprehensive software solutions to help businesses thrive in the digital age.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-lg p-8 hover:border-accent transition-all group">
              <s.icon className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
