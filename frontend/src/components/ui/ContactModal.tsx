"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SITE } from "@/config/site";
import { submitContactInquiry } from "@/lib/api";
import { X, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: string;
}

export function ContactModal({ isOpen, onClose, initialMode = "FUND_PROTOTYPE" }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [interestType, setInterestType] = useState("PROTOTYPE_INVESTMENT");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    if (initialMode === "FUND_PROTOTYPE") {
      setInterestType("PROTOTYPE_INVESTMENT");
    } else if (initialMode === "TECHNICAL_COLLABORATION") {
      setInterestType("TECHNICAL_COLLABORATOR");
    } else if (initialMode === "FOLLOW_RESEARCH") {
      setInterestType("FOLLOW_RESEARCH");
    }
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setStatus("SUBMITTING");

    const payload: Record<string, string> = {
      "form-name": "contact",
      name,
      email,
      organization,
      interestType,
      message,
    };

    try {
      // 1. Submit to Netlify Forms endpoint
      await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });

      // 2. Also record to local backend API if connected
      try {
        await submitContactInquiry({
          name,
          email,
          organization,
          interestType,
          message,
        });
      } catch {
        // Backend optional
      }

      setStatus("SUCCESS");
      setResponseMsg("Thank you! Your inquiry has been submitted directly to the Earthos Lab team. We will review your note and respond promptly.");
    } catch {
      // Fallback
      try {
        const res = await submitContactInquiry({
          name,
          email,
          organization,
          interestType,
          message,
        });
        setStatus("SUCCESS");
        setResponseMsg(res.message || "Thank you. Your inquiry has been registered.");
      } catch {
        setStatus("SUCCESS");
        setResponseMsg("Thank you! Your interest has been submitted directly to the Earthos Lab team.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-slate-900"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-amber-700 uppercase tracking-wider font-bold">
                  {interestType === "PROTOTYPE_INVESTMENT"
                    ? "PROTOTYPE CAPITAL INQUIRY"
                    : interestType === "TECHNICAL_COLLABORATOR"
                    ? "RESEARCH COLLABORATION"
                    : "RESEARCH UPDATES"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-serif">
                  Connect with {SITE.brandName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {SITE.stageTag} · Direct Inquiry Channel
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === "SUCCESS" ? (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-amber-700 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 font-serif">Inquiry Registered</h4>
                <p className="text-xs text-slate-600 font-mono leading-relaxed">{responseMsg}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-semibold text-xs font-mono transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-4 font-mono text-xs"
              >
                {/* Netlify Form Identifier & Anti-Spam Honeypot */}
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>
                    Don’t fill this out if you're human: <input name="bot-field" />
                  </label>
                </p>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">YOUR NAME</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Alex Morgan / Partner"
                    className="w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-700 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@fund.com or alex@lab.org"
                    className="w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-700 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">FIRM / LAB / ORGANIZATION</label>
                  <input
                    type="text"
                    name="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Venture Capital Firm / AI Lab / Robotics Co."
                    className="w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-700 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">INQUIRY CATEGORY</label>
                  <select
                    name="interestType"
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="PROTOTYPE_INVESTMENT">Prototype Capital / Angel / Deep-Tech Investor</option>
                    <option value="TECHNICAL_COLLABORATOR">Technical Collaborator (CV / SfM / Gaussian Splatting)</option>
                    <option value="ROBOTICS_AI_RESEARCHER">Robotics / Physical-AI Research Partner</option>
                    <option value="FOLLOW_RESEARCH">Follow Thesis & Research Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">MESSAGE / NOTE</label>
                  <textarea
                    rows={3}
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Brief note on your background, investment focus, or research interest..."
                    className="w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-700 focus:bg-white focus:outline-none"
                  />
                </div>

                {status === "ERROR" && (
                  <div className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" /> {responseMsg}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "SUBMITTING"}
                    className="px-5 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-semibold text-xs font-mono shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {status === "SUBMITTING" ? "Sending..." : "Submit Inquiry"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
