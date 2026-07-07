"use client";

import { useState } from "react";

const SUBJECTS = ["Order help", "Group quote", "New style request", "Commercial use", "Other"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, orderId, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setOrderId("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const inputBase =
    "w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-accent focus:outline-none";

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <p className="font-display text-2xl text-cream">Message sent</p>
        <p className="mt-2 text-muted">We&apos;ll get back to you within 24 hours.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold text-accent">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-8 shadow-card">
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-semibold text-cream">Name</label>
          <input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${inputBase}`} />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-semibold text-cream">Email</label>
          <input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inputBase}`} />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="contact-subject" className="text-sm font-semibold text-cream">Subject</label>
        <select id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={`mt-2 ${inputBase}`}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label htmlFor="contact-order" className="text-sm font-semibold text-cream">Order ID <span className="font-normal text-faint">(optional)</span></label>
        <input id="contact-order" value={orderId} onChange={(e) => setOrderId(e.target.value)} className={`mt-2 ${inputBase}`} />
      </div>
      <div className="mt-4">
        <label htmlFor="contact-message" className="text-sm font-semibold text-cream">Message</label>
        <textarea id="contact-message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={`mt-2 ${inputBase} resize-y`} />
      </div>
      {status === "error" && <p className="mt-4 text-sm text-accent">{errorMsg}</p>}
      <button type="submit" disabled={status === "loading"} className="mt-6 w-full rounded-full bg-accent py-3.5 text-base font-semibold text-white shadow-glow hover:bg-accent-bright disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
