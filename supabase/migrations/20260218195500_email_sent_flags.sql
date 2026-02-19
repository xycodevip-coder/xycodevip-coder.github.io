-- Track whether the acceptance email has been sent for each application.
-- NULL means never sent; a timestamp means it was sent at that time.
ALTER TABLE public.internship_applications
  ADD COLUMN IF NOT EXISTS acceptance_email_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Track whether the certificate email has been sent for each certificate.
-- NULL means never sent; a timestamp means it was sent at that time.
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS certificate_email_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast lookups on the new flag columns
CREATE INDEX IF NOT EXISTS idx_applications_acceptance_email_sent
  ON public.internship_applications(acceptance_email_sent_at)
  WHERE acceptance_email_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_certificates_cert_email_sent
  ON public.certificates(certificate_email_sent_at)
  WHERE certificate_email_sent_at IS NULL;
