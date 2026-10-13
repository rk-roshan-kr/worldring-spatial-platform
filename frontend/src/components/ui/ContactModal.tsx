"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SITE } from "@/config/site";
import { X, Send, CheckCircle2 } from "lucide-react";

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
  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS">("IDLE");

  useEffect(() => {
    if (initialMode === "FUND_PROTOTYPE") {
      setInterestType("PROTOTYPE_INVESTMENT");
    } else {
      setInterestType("GENERAL_INQUIRY");
    }
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setStatus("SUBMITTING");
    setTimeout(() => {
      setStatus("SUCCESS");
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl void-glass border-accent/30 shadow-[0_24px_48px_rgba(0,0,0,0.9)] z-10"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[0.68rem] uppercase text-accent font-semibold tracking-wider">
                  DIRECT ACCESS
                </span>
                <h3 className="font-serif text-[1.4rem] font-medium text-ink mt-0.5">
                  Discuss Prototype Collaboration
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "SUCCESS" ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-[1.2rem] text-ink font-medium">Inquiry Received</h4>
                <p className="text-muted text-[0.85rem] max-w-[36ch] mx-auto">
                  Thank you, {name}. Your note has been registered with the WorldRing core team. We will be in touch shortly.
                </p>
                <button
                  onClick={onClose}
                  className="btn-pill-primary text-[0.82rem] py-2 px-6 mt-4 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-[0.78rem]">
                <div>
                  <label className="block text-muted mb-1 text-[0.7rem] uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 text-[0.7rem] uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@domain.xyz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 text-[0.7rem] uppercase">Organization / Fund</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Spatial Ventures / Robotics Lab"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 text-[0.7rem] uppercase">Note / Area of Interest</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We would like to review the raw Sector 17 point cloud and discuss prototype participation..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ink focus:border-accent focus:outline-none resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "SUBMITTING"}
                  className="w-full btn-pill-primary justify-center py-3 text-[0.85rem] mt-2 group cursor-pointer"
                >
                  <span>{status === "SUBMITTING" ? "Registering..." : "Transmit Message"}</span>
                  <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
