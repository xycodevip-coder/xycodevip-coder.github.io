import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TechStackSection from "@/components/TechStackSection";
import InternshipSection from "@/components/InternshipSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Global background gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, hsl(258 85% 62% / 0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, hsl(316 85% 62% / 0.06) 0%, transparent 55%)",
        }}
      />

      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <TechStackSection />
        <InternshipSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
