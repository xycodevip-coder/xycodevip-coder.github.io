import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, LogOut, Loader2, Shield, Mail, Check, X,
  PackageCheck, PackageX, Send, Award, FileText, ChevronDown, ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { internshipTracks } from "./Internships";

/* ─────────────────────────── Types ─────────────────────────── */

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  student_email: string | null;
  internship_title: string;
  issue_date: string;
  status: string;
  task_delivered: boolean;
  certificate_email_sent_at: string | null;
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
  acceptance_email_sent_at: string | null;
}

interface TaskSubmission {
  id: string;
  full_name: string;
  email: string;
  track: string;
  submission_notes: string | null;
  github_submission_url: string | null;
  linkedin_post_url: string | null;
  task_delivered: boolean;
  submitted_at: string;
}

interface EnrichedSubmission extends TaskSubmission {
  certificate: Certificate | null;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const emptyForm = () => ({
  certificate_number: "",
  student_name: "",
  student_email: "",
  internship_title: "",
  issue_date: new Date().toISOString().split("T")[0],
  status: "active",
  task_delivered: true,
});

/** Generate the next certificate number from the current list. */
function nextCertNumber(certs: Certificate[]): string {
  const year = new Date().getFullYear();
  const maxNum = certs.reduce((max, c) => {
    const parts = c.certificate_number.split("-");
    if (parts.length === 3 && !isNaN(parseInt(parts[2]))) return Math.max(max, parseInt(parts[2]));
    return max;
  }, 0);
  return `XY-${year}-${(maxNum + 1).toString().padStart(3, "0")}`;
}

/* ─────────────────────────── Component ─────────────────────────── */

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Certificate dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [linkedSubmission, setLinkedSubmission] = useState<TaskSubmission | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  // Per-row loading states (keyed by id)
  const [sendingCertEmail, setSendingCertEmail] = useState<string | null>(null);
  const [sendingAcceptEmail, setSendingAcceptEmail] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Expanded submission rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Prevent double-fetch on strict-mode double-invoke
  const fetchedRef = useRef(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  /* ── Auth ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAll();
    }
  }, [user]);

  /* ── Data fetching – single batched call ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [certsRes, appsRes, subsRes] = await Promise.all([
      supabase.from("certificates").select("*").order("created_at", { ascending: false }),
      supabase.from("internship_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("task_submissions").select("*").order("submitted_at", { ascending: false }),
    ]);
    setCerts((certsRes.data as unknown as Certificate[]) || []);
    setApplications((appsRes.data as unknown as Application[]) || []);
    setTaskSubmissions((subsRes.data as unknown as TaskSubmission[]) || []);
    setLoading(false);
  }, []);

  /* ── Memoised derived data ── */
  const enrichedSubmissions = useMemo<EnrichedSubmission[]>(() =>
    taskSubmissions.map((sub) => ({
      ...sub,
      certificate: certs.find(
        (c) =>
          (c.student_email ?? "").toLowerCase() === sub.email.toLowerCase() ||
          c.student_name.toLowerCase() === sub.full_name.toLowerCase()
      ) ?? null,
    })),
    [taskSubmissions, certs]
  );

  const standaloneCerts = useMemo(() =>
    certs.filter(
      (c) =>
        !taskSubmissions.some(
          (s) =>
            s.email.toLowerCase() === (c.student_email ?? "").toLowerCase() ||
            s.full_name.toLowerCase() === c.student_name.toLowerCase()
        )
    ),
    [certs, taskSubmissions]
  );

  const submissionsWithoutCert = useMemo(
    () => enrichedSubmissions.filter((s) => !s.certificate).length,
    [enrichedSubmissions]
  );

  /* ── Certificate dialog helpers ── */
  const openCreateForSubmission = useCallback((sub: TaskSubmission) => {
    setEditingCert(null);
    setLinkedSubmission(sub);
    setForm({
      certificate_number: nextCertNumber(certs),
      student_name: sub.full_name,
      student_email: sub.email,
      internship_title: sub.track,
      issue_date: new Date().toISOString().split("T")[0],
      status: "active",
      task_delivered: true,
    });
    setDialogOpen(true);
  }, [certs]);

  const openCreateStandalone = useCallback(() => {
    setEditingCert(null);
    setLinkedSubmission(null);
    setForm({ ...emptyForm(), certificate_number: nextCertNumber(certs) });
    setDialogOpen(true);
  }, [certs]);

  const openEdit = useCallback((c: Certificate) => {
    setEditingCert(c);
    setLinkedSubmission(null);
    setForm({
      certificate_number: c.certificate_number,
      student_name: c.student_name,
      student_email: c.student_email || "",
      internship_title: c.internship_title,
      issue_date: c.issue_date,
      status: c.status,
      task_delivered: c.task_delivered,
    });
    setDialogOpen(true);
  }, []);

  /* ── Save certificate (optimistic local update) ── */
  const handleSave = async () => {
    if (!form.certificate_number || !form.student_name || !form.internship_title) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingCert) {
      const patch = {
        certificate_number: form.certificate_number,
        student_name: form.student_name,
        student_email: form.student_email || null,
        internship_title: form.internship_title,
        issue_date: form.issue_date,
        status: form.status,
        task_delivered: form.task_delivered,
      };
      const { error } = await supabase.from("certificates").update(patch).eq("id", editingCert.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        // Optimistic update – no full re-fetch
        setCerts((prev) => prev.map((c) => c.id === editingCert.id ? { ...c, ...patch } : c));
        toast({ title: "Certificate updated" });
      }
    } else {
      const { data, error } = await supabase.from("certificates").insert({
        certificate_number: form.certificate_number,
        student_name: form.student_name,
        student_email: form.student_email || null,
        internship_title: form.internship_title,
        issue_date: form.issue_date,
        status: form.status,
        task_delivered: form.task_delivered,
        created_by: user.id,
      }).select().single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setCerts((prev) => [data as unknown as Certificate, ...prev]);
        toast({ title: "Certificate created" });
      }
    }
    setSaving(false);
    setDialogOpen(false);
  };

  /* ── Delete certificate (optimistic) ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCerts((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Certificate deleted" });
    }
  };

  /* ── Toggle task delivered (optimistic) ── */
  const handleToggleTaskDelivered = async (cert: Certificate) => {
    const newValue = !cert.task_delivered;
    const { error } = await supabase.from("certificates").update({ task_delivered: newValue }).eq("id", cert.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCerts((prev) => prev.map((c) => c.id === cert.id ? { ...c, task_delivered: newValue } : c));
      toast({ title: newValue ? "Marked as Delivered" : "Marked as Not Delivered" });
    }
  };

  /* ── Send certificate email – with deduplication guard ── */
  const handleSendCertificateEmail = async (cert: Certificate) => {
    if (!cert.student_email) {
      toast({
        title: "No Email",
        description: "This certificate has no student email. Please edit and add one first.",
        variant: "destructive",
      });
      return;
    }

    // Deduplication: block if already sent
    if (cert.certificate_email_sent_at) {
      const sentDate = new Date(cert.certificate_email_sent_at).toLocaleString();
      toast({
        title: "Already Sent",
        description: `Certificate email was already sent on ${sentDate}. Use the resend button if you need to send again.`,
        variant: "destructive",
      });
      return;
    }

    setSendingCertEmail(cert.id);
    try {
      toast({ title: "Sending certificate email..." });
      const { data, error: fnError } = await supabase.functions.invoke("send-certificate-email", {
        body: {
          name: cert.student_name,
          email: cert.student_email,
          track: cert.internship_title,
          certificate_number: cert.certificate_number,
          issue_date: cert.issue_date,
        },
      });
      if (fnError) {
        console.error("Certificate email fnError:", fnError, "data:", data);
        const detail = (data as any)?.error ?? (typeof data === 'string' ? data : null) ?? fnError.message ?? String(fnError);
        throw new Error(detail);
      }

      // Mark as sent in DB + optimistic update
      const sentAt = new Date().toISOString();
      await supabase.from("certificates").update({ certificate_email_sent_at: sentAt } as any).eq("id", cert.id);
      setCerts((prev) => prev.map((c) => c.id === cert.id ? { ...c, certificate_email_sent_at: sentAt } : c));

      toast({ title: "Certificate email sent!", description: `Sent to ${cert.student_email}` });
    } catch (err: any) {
      console.error("Failed to send certificate email:", err);
      toast({
        title: "Email failed",
        description: err?.message ?? "Could not send certificate email. Check the Edge Function configuration.",
        variant: "destructive",
      });
    } finally {
      setSendingCertEmail(null);
    }
  };

  /* ── Resend certificate email (bypasses dedup guard) ── */
  const handleResendCertificateEmail = async (cert: Certificate) => {
    if (!cert.student_email) return;
    setSendingCertEmail(cert.id);
    try {
      toast({ title: "Resending certificate email..." });
      const { data, error: fnError } = await supabase.functions.invoke("send-certificate-email", {
        body: {
          name: cert.student_name,
          email: cert.student_email,
          track: cert.internship_title,
          certificate_number: cert.certificate_number,
          issue_date: cert.issue_date,
        },
      });
      if (fnError) {
        console.error("Resend certificate email fnError:", fnError, "data:", data);
        const detail = (data as any)?.error ?? (typeof data === 'string' ? data : null) ?? fnError.message ?? String(fnError);
        throw new Error(detail);
      }
      const sentAt = new Date().toISOString();
      await supabase.from("certificates").update({ certificate_email_sent_at: sentAt } as any).eq("id", cert.id);
      setCerts((prev) => prev.map((c) => c.id === cert.id ? { ...c, certificate_email_sent_at: sentAt } : c));
      toast({ title: "Certificate email resent!", description: `Sent to ${cert.student_email}` });
    } catch (err: any) {
      toast({
        title: "Email failed",
        description: err?.message ?? "Could not resend certificate email.",
        variant: "destructive",
      });
    } finally {
      setSendingCertEmail(null);
    }
  };

  /* ── Update application status + send acceptance email with dedup ── */
  const handleUpdateStatus = async (id: string, status: string, app?: Application) => {
    setUpdatingStatus(id);
    const { error } = await supabase.from("internship_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setUpdatingStatus(null);
      return;
    }

    // Optimistic update
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    toast({ title: `Application ${status}` });

    if (status === "accepted" && app) {
      // Deduplication: only send if not already sent
      if (app.acceptance_email_sent_at) {
        toast({
          title: "Note",
          description: `Acceptance email was already sent on ${new Date(app.acceptance_email_sent_at).toLocaleString()}. Status updated.`,
        });
        setUpdatingStatus(null);
        return;
      }

      setSendingAcceptEmail(id);
      try {
        toast({ title: "Sending acceptance email..." });
        const { error: fnError } = await supabase.functions.invoke("send-acceptance-email", {
          body: { name: app.full_name, email: app.email, track: app.track },
        });
        if (fnError) throw fnError;

        const sentAt = new Date().toISOString();
        await supabase.from("internship_applications").update({ acceptance_email_sent_at: sentAt } as any).eq("id", id);
        setApplications((prev) => prev.map((a) => a.id === id ? { ...a, acceptance_email_sent_at: sentAt } : a));
        toast({ title: "Acceptance email sent!", description: `Sent to ${app.email}` });
      } catch (err: any) {
        console.error("Failed to send email:", err);
        toast({
          title: "Email failed",
          description: err?.message ?? "Status updated, but email could not be sent. Check Edge Function.",
          variant: "destructive",
        });
      } finally {
        setSendingAcceptEmail(null);
      }
    }
    setUpdatingStatus(null);
  };

  /* ── Resend acceptance email (bypasses dedup guard) ── */
  const handleResendAcceptanceEmail = async (app: Application) => {
    setSendingAcceptEmail(app.id);
    try {
      toast({ title: "Resending acceptance email..." });
      const { error: fnError } = await supabase.functions.invoke("send-acceptance-email", {
        body: { name: app.full_name, email: app.email, track: app.track },
      });
      if (fnError) throw fnError;
      const sentAt = new Date().toISOString();
      await supabase.from("internship_applications").update({ acceptance_email_sent_at: sentAt } as any).eq("id", app.id);
      setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, acceptance_email_sent_at: sentAt } : a));
      toast({ title: "Acceptance email resent!", description: `Sent to ${app.email}` });
    } catch (err: any) {
      toast({
        title: "Email failed",
        description: err?.message ?? "Could not resend acceptance email.",
        variant: "destructive",
      });
    } finally {
      setSendingAcceptEmail(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (!user) return null;

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border h-16 flex items-center sticky top-0 z-10">
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
        <Tabs defaultValue="submissions-certificates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions-certificates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Task Submissions &amp; Certificates
              {submissionsWithoutCert > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                  {submissionsWithoutCert}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">Internship Applications</TabsTrigger>
          </TabsList>

          {/* ══ TASK SUBMISSIONS & CERTIFICATES TAB ══ */}
          <TabsContent value="submissions-certificates">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Task Submissions &amp; Certificates</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review intern task submissions and issue or manage their certificates from one place.
                  </p>
                </div>
                <Button onClick={openCreateStandalone} className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> New Certificate
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
              ) : (
                <>
                  {/* ── Submissions table ── */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Task Submissions
                      <span className="text-sm font-normal text-muted-foreground">({enrichedSubmissions.length})</span>
                    </h3>

                    {enrichedSubmissions.length === 0 ? (
                      <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <p className="text-muted-foreground">No task submissions yet.</p>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead>Track</TableHead>
                              <TableHead className="hidden md:table-cell">Submission Link</TableHead>
                              <TableHead className="hidden lg:table-cell">LinkedIn Post</TableHead>
                              <TableHead>Certificate</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {enrichedSubmissions.map((sub) => {
                              const cert = sub.certificate;
                              const isExpanded = expandedRows.has(sub.id);
                              return (
                                <React.Fragment key={sub.id}>
                                  <TableRow key={sub.id} className={isExpanded ? "bg-muted/30" : ""}>
                                    <TableCell>
                                      <button
                                        onClick={() => toggleRow(sub.id)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                      {new Date(sub.submitted_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-medium">{sub.full_name}</div>
                                      <div className="text-xs text-muted-foreground">{sub.email}</div>
                                    </TableCell>
                                    <TableCell>{sub.track}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      {sub.github_submission_url ? (
                                        <a href={sub.github_submission_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View Submission</a>
                                      ) : <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      {sub.linkedin_post_url ? (
                                        <a href={sub.linkedin_post_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View Post</a>
                                      ) : <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>
                                      {cert ? (
                                        <div className="flex flex-col gap-1">
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                            <Award className="w-3 h-3" /> {cert.certificate_number}
                                          </span>
                                          {cert.certificate_email_sent_at && (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                                              Email sent {new Date(cert.certificate_email_sent_at).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                          <PackageX className="w-3 h-3" /> Not Issued
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        {!cert && (
                                          <Button
                                            variant="outline" size="sm"
                                            className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/5"
                                            onClick={() => openCreateForSubmission(sub)}
                                          >
                                            <Award className="w-3 h-3 mr-1" /> Issue Cert
                                          </Button>
                                        )}
                                        {cert && (
                                          <>
                                            {/* Send / Resend cert email */}
                                            <Button
                                              variant="ghost" size="icon"
                                              title={cert.certificate_email_sent_at ? "Resend Certificate Email" : "Send Certificate Email"}
                                              disabled={sendingCertEmail === cert.id}
                                              onClick={() => cert.certificate_email_sent_at
                                                ? handleResendCertificateEmail(cert)
                                                : handleSendCertificateEmail(cert)}
                                              className={cert.certificate_email_sent_at
                                                ? "text-green-500 hover:text-green-700 hover:bg-green-50"
                                                : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"}
                                            >
                                              {sendingCertEmail === cert.id
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : cert.certificate_email_sent_at
                                                  ? <CheckCircle2 className="w-4 h-4" />
                                                  : <Send className="w-4 h-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(cert)} className="text-muted-foreground hover:text-foreground">
                                              <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)} className="text-muted-foreground hover:text-destructive">
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>

                                  {/* Expanded row */}
                                  {isExpanded && (
                                    <TableRow key={`${sub.id}-exp`} className="bg-muted/20 hover:bg-muted/20">
                                      <TableCell colSpan={8} className="py-4 px-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Submission Details</p>
                                            {sub.submission_notes
                                              ? <p className="text-sm text-foreground">{sub.submission_notes}</p>
                                              : <p className="text-sm text-muted-foreground italic">No notes provided.</p>}
                                            <div className="flex flex-wrap gap-3 mt-2">
                                              {sub.github_submission_url && (
                                                <a href={sub.github_submission_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">GitHub / Submission Link ↗</a>
                                              )}
                                              {sub.linkedin_post_url && (
                                                <a href={sub.linkedin_post_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">LinkedIn Post ↗</a>
                                              )}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Certificate Details</p>
                                            {cert ? (
                                              <div className="space-y-1 text-sm">
                                                <div className="flex gap-2"><span className="text-muted-foreground w-36">Certificate #:</span><span className="font-mono font-medium">{cert.certificate_number}</span></div>
                                                <div className="flex gap-2"><span className="text-muted-foreground w-36">Issue Date:</span><span>{cert.issue_date}</span></div>
                                                <div className="flex gap-2 items-center"><span className="text-muted-foreground w-36">Status:</span>
                                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cert.status === "active" ? "bg-green-100 text-green-700" : cert.status === "revoked" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{cert.status}</span>
                                                </div>
                                                <div className="flex gap-2 items-center"><span className="text-muted-foreground w-36">Task Delivered:</span>
                                                  <button onClick={() => handleToggleTaskDelivered(cert)} className="flex items-center gap-1 group">
                                                    {cert.task_delivered
                                                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors"><PackageCheck className="w-3 h-3" /> Delivered</span>
                                                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-colors"><PackageX className="w-3 h-3" /> Pending</span>}
                                                  </button>
                                                </div>
                                                <div className="flex gap-2 items-center"><span className="text-muted-foreground w-36">Email Status:</span>
                                                  {cert.certificate_email_sent_at
                                                    ? <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Sent {new Date(cert.certificate_email_sent_at).toLocaleString()}</span>
                                                    : <span className="text-xs text-muted-foreground">Not sent yet</span>}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-3">
                                                <p className="text-sm text-muted-foreground italic">No certificate issued yet.</p>
                                                <Button size="sm" className="bg-primary text-white hover:bg-primary/90 h-7 text-xs" onClick={() => openCreateForSubmission(sub)}>
                                                  <Award className="w-3 h-3 mr-1" /> Issue Now
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* ── Standalone certs ── */}
                  {standaloneCerts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Other Certificates
                        <span className="text-sm font-normal text-muted-foreground">(not submitted)</span>
                      </h3>
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Certificate #</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead className="hidden md:table-cell">Internship</TableHead>
                              <TableHead className="hidden md:table-cell">Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Task Delivered</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standaloneCerts.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell className="font-mono text-sm">{c.certificate_number}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{c.student_name}</div>
                                  {c.student_email && <div className="text-xs text-muted-foreground">{c.student_email}</div>}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{c.internship_title}</TableCell>
                                <TableCell className="hidden md:table-cell">{c.issue_date}</TableCell>
                                <TableCell>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : c.status === "revoked" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                                </TableCell>
                                <TableCell>
                                  <button onClick={() => handleToggleTaskDelivered(c)} className="flex items-center gap-1.5 group">
                                    {c.task_delivered
                                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors"><PackageCheck className="w-3 h-3" /> Delivered</span>
                                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-colors"><PackageX className="w-3 h-3" /> Pending</span>}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  {c.certificate_email_sent_at
                                    ? <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Sent</span>
                                    : <span className="text-xs text-muted-foreground">Not sent</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost" size="icon"
                                      title={c.certificate_email_sent_at ? "Resend Certificate Email" : "Send Certificate Email"}
                                      disabled={sendingCertEmail === c.id}
                                      onClick={() => c.certificate_email_sent_at ? handleResendCertificateEmail(c) : handleSendCertificateEmail(c)}
                                      className={c.certificate_email_sent_at ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"}
                                    >
                                      {sendingCertEmail === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : c.certificate_email_sent_at ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ══ APPLICATIONS TAB ══ */}
          <TabsContent value="applications">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Internship Applications</h2>
            {loading ? (
              <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" /></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20"><p className="text-muted-foreground">No applications received yet.</p></div>
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
                      <TableHead>Email</TableHead>
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
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${app.status === "accepted" ? "bg-green-100 text-green-700" : app.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {app.acceptance_email_sent_at
                            ? <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Sent</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {app.status !== "accepted" && (
                              <Button
                                variant="outline" size="sm"
                                className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                title="Accept & Send Email"
                                disabled={updatingStatus === app.id}
                                onClick={() => handleUpdateStatus(app.id, "accepted", app)}
                              >
                                {updatingStatus === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                            )}
                            {app.status === "accepted" && (
                              <Button
                                variant="ghost" size="sm"
                                className={`h-8 w-8 p-0 ${app.acceptance_email_sent_at ? "text-green-500 hover:text-green-700" : "text-blue-600 hover:text-blue-700"}`}
                                title={app.acceptance_email_sent_at ? "Resend Acceptance Email" : "Send Acceptance Email"}
                                disabled={sendingAcceptEmail === app.id}
                                onClick={() => handleResendAcceptanceEmail(app)}
                              >
                                {sendingAcceptEmail === app.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : app.acceptance_email_sent_at
                                    ? <CheckCircle2 className="w-4 h-4" />
                                    : <Mail className="w-4 h-4" />}
                              </Button>
                            )}
                            {app.status !== "rejected" && (
                              <Button
                                variant="outline" size="sm"
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                title="Reject"
                                disabled={updatingStatus === app.id}
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

      {/* ══ CERTIFICATE DIALOG ══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {editingCert ? "Edit Certificate" : linkedSubmission ? `Issue Certificate — ${linkedSubmission.full_name}` : "New Certificate"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Certificate Number</Label>
              <div className="flex gap-2">
                <Input value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} placeholder="XY-2026-001" />
                <Button type="button" variant="outline" onClick={() => setForm({ ...form, certificate_number: nextCertNumber(certs) })}>Generate</Button>
              </div>
            </div>
            <div>
              <Label>Student Name</Label>
              <Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <Label>Student Email <span className="text-muted-foreground text-xs">(for sending certificate)</span></Label>
              <Input type="email" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div>
              <Label>Internship Track</Label>
              <Select value={form.internship_title} onValueChange={(v) => setForm({ ...form, internship_title: v })}>
                <SelectTrigger><SelectValue placeholder="Select Track" /></SelectTrigger>
                <SelectContent>
                  {internshipTracks.map((t) => <SelectItem key={t.id} value={t.title}>{t.title}</SelectItem>)}
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
            <div className="flex items-center gap-3">
              <input type="checkbox" id="task_delivered" checked={form.task_delivered} onChange={(e) => setForm({ ...form, task_delivered: e.target.checked })} className="w-4 h-4 accent-primary" />
              <Label htmlFor="task_delivered">Task Delivered by Student</Label>
            </div>
            <Button onClick={handleSave} className="w-full bg-primary text-white hover:bg-primary/90" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCert ? "Update Certificate" : "Issue Certificate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
