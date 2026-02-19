import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const contacts = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@xycode.com",
    href: "mailto:contact@xycode.com",
    color: "text-violet-500 dark:text-violet-400",
    bg: "from-violet-500/15 to-violet-500/5",
    border: "hover:border-violet-400/40",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "New York, NY · Cairo, Egypt",
    href: null,
    color: "text-rose-500 dark:text-rose-400",
    bg: "from-rose-500/15 to-rose-500/5",
    border: "hover:border-rose-400/40",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "from-cyan-500/15 to-cyan-500/5",
    border: "hover:border-cyan-400/40",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/10 pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--secondary)), transparent)" }}
      />

      {/* Decorative orbs */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] orb orb-primary opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] orb orb-cyan opacity-15 pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 badge-glass text-secondary mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get In{" "}
            <span className="text-gradient-cyan">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Have a project in mind or want to join our internship program? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {contacts.map((c) => {
            const Inner = (
              <div className={`glass-card p-8 text-center group border border-border/50 transition-all duration-300 ${c.border} hover:-translate-y-1`}>
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <c.icon className={`w-7 h-7 ${c.color}`} />
                </div>
                <h4 className="font-display font-bold text-foreground text-lg mb-2">{c.title}</h4>
                <p className={`text-sm font-medium ${c.href ? "text-muted-foreground group-hover:text-primary transition-colors duration-200" : "text-muted-foreground"}`}>
                  {c.value}
                </p>
              </div>
            );

            return c.href ? (
              <a key={c.title} href={c.href} className="block">
                {Inner}
              </a>
            ) : (
              <div key={c.title}>{Inner}</div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="max-w-2xl mx-auto glass-card p-8 md:p-10 text-center border border-border/50">
          <h3 className="font-display text-2xl font-bold text-foreground mb-3">
            Ready to start your project?
          </h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Reach out to us today and let's discuss how XY CODE can help bring your vision to life.
          </p>
          <a href="mailto:contact@xycode.com">
            <Button
              size="lg"
              className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 hover:scale-105 transition-all duration-300 font-semibold px-8"
            >
              <Send className="mr-2 w-4 h-4" />
              Send Us a Message
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
