import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global background gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, hsl(258 85% 62% / 0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, hsl(316 85% 62% / 0.06) 0%, transparent 55%)",
        }}
      />

      <Navbar />
      <main className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Privacy policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: March 9, 2026
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  XY CODE ("Company," "we," "us," or "our") operates the website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service. If you have any questions or concerns about our privacy practices, please contact us at the contact information provided at the end of this policy.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We may collect personal information that you provide directly, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                      <li>Name and email address</li>
                      <li>Phone number</li>
                      <li>Academic information (for internship applications)</li>
                      <li>Resume and portfolio information</li>
                      <li>LinkedIn profile information</li>
                      <li>Any other information you choose to provide</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Automatically Collected Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      When you visit the Service, we may automatically collect technical information including:
                    </p>
                    <ul className="list-disc list-inside mt-3 space-y-2 text-muted-foreground">
                      <li>IP address</li>
                      <li>Browser type and version</li>
                      <li>Operating system</li>
                      <li>Pages visited and time spent on pages</li>
                      <li>Referral source</li>
                      <li>Device identifiers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect in various ways, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To operate and improve the Service</li>
                  <li>To process and fulfill internship applications</li>
                  <li>To send you communication about our services</li>
                  <li>To verify your identity and prevent fraud</li>
                  <li>To respond to your inquiries and requests</li>
                  <li>To send marketing and promotional materials (with your consent)</li>
                  <li>To analyze usage patterns and improve user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Disclosure of Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may disclose your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>With Service Providers:</strong> With vendors and contractors who assist us in operating our website and conducting our business</li>
                  <li><strong>For Legal Compliance:</strong> To comply with legal obligations, court orders, or government requests</li>
                  <li><strong>To Protect Rights:</strong> To enforce our terms and conditions and protect our legal rights, privacy, and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> With any third party when you explicitly consent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is completely secure. While we strive to protect your personal information, we cannot guarantee absolute security.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We use industry-standard encryption (SSL/TLS) to protect sensitive information transmitted through our Service.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Right to Access:</strong> You have the right to request access to the personal information we hold about you</li>
                  <li><strong>Right to Correction:</strong> You have the right to request that we correct inaccurate information</li>
                  <li><strong>Right to Deletion:</strong> You have the right to request deletion of your personal information</li>
                  <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw your consent at any time</li>
                  <li><strong>Right to Opt-Out:</strong> You may opt out of receiving promotional communications from us</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on the Service. Cookies are small text files stored on your device that help us remember your preferences and track your activity.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Types of cookies we use include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how you use the website</li>
                  <li><strong>Preference Cookies:</strong> Remember your choices and settings</li>
                  <li><strong>Marketing Cookies:</strong> Used to track your activity for advertising purposes</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You can control cookies through your browser settings. Please note that disabling cookies may affect the functionality of the Service.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service may contain links to third-party websites and services. This Privacy Policy does not apply to third-party websites or services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services before providing your personal information.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information and terminate the child's account.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, unless a longer retention period is required by law. Once your information is no longer needed, we will securely delete or anonymize it.
                </p>
              </CardContent>
            </Card>

            {/* Section 11 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by updating the "Last updated" date at the top of this policy and posting the revised policy on the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Section 12 */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <p className="font-semibold mb-2">XY CODE</p>
                  <p className="text-muted-foreground text-sm">
                    Email: contact@xycode.com
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Website: www.xycode.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
