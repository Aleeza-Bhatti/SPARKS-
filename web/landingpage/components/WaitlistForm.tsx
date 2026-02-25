"use client";

import { FormEvent, useMemo, useState } from "react";

type WaitlistFormProps = {
  source: "hero" | "final";
};

type FormStatus = "idle" | "submitting" | "success" | "error";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function WaitlistForm({ source }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const formId = useMemo(() => `waitlist-form-${source}`, [source]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    if (!emailRegex.test(trimmedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!normalizedPhone || normalizedPhone.length < 7) {
      setStatus("error");
      setMessage("Please enter a valid phone number.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: normalizedPhone,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Something went wrong.");
      }

      setStatus("success");
      setMessage(payload.message || "You're in, welcome to Sparks.");
      setSubmittedEmail(trimmedEmail);
      setSubmittedPhone(normalizedPhone);
      setEmail("");
      setPhone("");
      setShareCopied(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit right now.");
    }
  }

  async function onShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }

  return (
    <div className={`waitlist-form-shell ${source === "final" ? "waitlist-form-shell-final" : ""}`.trim()}>
      <form id={formId} className="waitlist-form" onSubmit={onSubmit} noValidate>
        <label htmlFor={`${formId}-email`}>Email</label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <label htmlFor={`${formId}-phone`}>Phone</label>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          required
          placeholder="+1 555 000 0000"
        />

        <button type="submit" className="primary-button" disabled={status === "submitting"}>
          {status === "submitting" ? "Joining..." : "Join the Waitlist"}
        </button>
      </form>

      <p className="microcopy">Launching soon. Early access + updates.</p>
      <p className="privacy-line">
        By joining, you agree to receive email and SMS updates. Unsubscribe anytime.
      </p>
      <p className="no-spam">No spam.</p>

      <p
        className={`form-status ${status === "success" ? "success" : ""} ${status === "error" ? "error" : ""}`.trim()}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>

      {status === "success" ? (
        <>
          <div className="success-card" role="status" aria-live="polite">
            <p className="success-title">Added to waitlist</p>
            <p className="success-detail">Email: {submittedEmail}</p>
            <p className="success-detail">Phone: {submittedPhone}</p>
          </div>
          <div className="success-burst" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <button type="button" className="share-button" onClick={onShare}>
            {shareCopied ? "Link copied" : "Share Sparks"}
          </button>
        </>
      ) : null}
    </div>
  );
}
