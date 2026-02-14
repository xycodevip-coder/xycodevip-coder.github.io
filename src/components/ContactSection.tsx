import { Mail, MapPin, Phone } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Contact Us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a project in mind or want to join our internship program? We'd love to hear from you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-display font-bold text-foreground mb-1">Email</h4>
            <p className="text-muted-foreground text-sm">contact@xycode.com</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-display font-bold text-foreground mb-1">Location</h4>
            <p className="text-muted-foreground text-sm">New York, NY · Cairo, Egypt</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-display font-bold text-foreground mb-1">Phone</h4>
            <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
