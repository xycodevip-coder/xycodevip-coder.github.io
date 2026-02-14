import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, Loader2, Shield, Mail, Check, X } from "lucide-react";
import { internshipTracks } from "./Internships";

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  internship_title: string;
  issue_date: string;
  status: string;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  track: string;
  github_url: string;
  portfolio_url: string;
  motivation: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [form, setForm] = useState({ certificate_number: "", student_name: "", internship_title: "", issue_date: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCerts();
      fetchApplications();
    }
  }, [user]);

  const fetchCerts = async () => {
    setLoading(true);
    const { data } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
    setCerts((data as Certificate[]) || []);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const { data } = await supabase.from("internship_applications").select("*").order("created_at", { ascending: false });
    setApplications((data as Application[]) || []);
  };

  const openCreate = () => {
    setEditingCert(null);
    setForm({ certificate_number: "", student_name: "", internship_title: "", issue_date: new Date().toISOString().split("T")[0], status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditingCert(c);
    setForm({ certificate_number: c.certificate_number, student_name: c.student_name, internship_title: c.internship_title, issue_date: c.issue_date, status: c.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.certificate_number || !form.student_name || !form.internship_title) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingCert) {
      const { error } = await supabase.from("certificates").update(form).eq("id", editingCert.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Certificate updated" });
    } else {
      const { error } = await supabase.from("certificates").insert({ ...form, created_by: user.id });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Certificate created" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchCerts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Certificate deleted" });
      fetchCerts();
    }
  };

  const handleUpdateStatus = async (id: string, status: string, email?: string, name?: string, track?: string) => {
    const { error } = await supabase.from("internship_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      fetchApplications();

      if (status === "accepted" && email && name && track) {
        try {
          toast({ title: "Sending acceptance email..." });
          const { error: fnError } = await supabase.functions.invoke('send-acceptance-email', {
            body: { name, email, track }
          });
          if (fnError) throw fnError;
          toast({ title: "Email sent successfully" });
        } catch (err) {
          console.error("Failed to send email:", err);
          toast({
            title: "Email failed",
            description: "Status updated, but email could not be sent. Check Edge Function.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border h-16 flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent" />
            <h1 className="font-display font-bold text-foreground text-lg">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="certificates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="applications">Internship Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="certificates">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Certificates</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate} className="bg-primary text-white hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">{editingCert ? "Edit Certificate" : "New Certificate"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Certificate Number</Label>
                      <div className="flex gap-2">
                        <Input value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} placeholder="XY-2026-001" />
                        <Button type="button" variant="outline" onClick={() => {
                          const currentYear = new Date().getFullYear();
                          if (certs.length === 0) {
                            setForm({ ...form, certificate_number: `XY-${currentYear}-001` });
                            return;
                          }

                          // Extract numbers from existing certs to find max
                          const maxNum = certs.reduce((max, cert) => {
                            const parts = cert.certificate_number.split('-');
                            if (parts.length === 3 && !isNaN(parseInt(parts[2]))) {
                              return Math.max(max, parseInt(parts[2]));
                            }
                            return max;
                          }, 0);

                          const nextNum = (maxNum + 1).toString().padStart(3, '0');
                          setForm({ ...form, certificate_number: `XY-${currentYear}-${nextNum}` });
                        }}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Student Name</Label>
                      <Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div>
                      <Label>Internship Track</Label>
                      <Select value={form.internship_title} onValueChange={(v) => setForm({ ...form, internship_title: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Track" /></SelectTrigger>
                        <SelectContent>
                          {internshipTracks.map((t) => (
                            <SelectItem key={t.id} value={t.title}>{t.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Issue Date</Label>
                      <Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="revoked">Revoked</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSave} className="w-full bg-primary text-white hover:bg-primary/90" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {editingCert ? "Update" : "Create"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
            ) : certs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No certificates yet. Create your first one!</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">Internship</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certs.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.certificate_number}</TableCell>
                        <TableCell>{c.student_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{c.internship_title}</TableCell>
                        <TableCell className="hidden md:table-cell">{c.issue_date}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : c.status === "revoked" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Internship Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No applications received yet.</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead className="hidden md:table-cell">University</TableHead>
                      <TableHead className="hidden lg:table-cell">Portfolio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{app.full_name}</div>
                          <div className="text-xs text-muted-foreground">{app.email}</div>
                        </TableCell>
                        <TableCell>{app.track}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{app.university}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {app.github_url && <a href={app.github_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline mr-2">GitHub</a>}
                          {app.portfolio_url && <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Portfolio</a>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${app.status === "accepted" ? "bg-green-100 text-green-700" :
                            app.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {app.status !== 'accepted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                title="Accept & Send Email"
                                onClick={() => handleUpdateStatus(app.id, "accepted", app.email, app.full_name, app.track)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {app.status === 'accepted' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                title="Resend Acceptance Email"
                                onClick={async () => {
                                  try {
                                    toast({ title: "Sending acceptance email..." });
                                    const { error: fnError } = await supabase.functions.invoke('send-acceptance-email', {
                                      body: { name: app.full_name, email: app.email, track: app.track }
                                    });
                                    if (fnError) throw fnError;
                                    toast({ title: "Email sent successfully" });
                                  } catch (err) {
                                    console.error("Failed to send email:", err);
                                    toast({
                                      title: "Email failed",
                                      description: "Could not send email. Check Edge Function.",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            {app.status !== 'rejected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                title="Reject"
                                onClick={() => handleUpdateStatus(app.id, "rejected")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
