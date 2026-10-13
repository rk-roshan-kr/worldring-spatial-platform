import React from "react";

export const dynamic = "error"; // Force 100% static prerender at build time

export default function FormsPage() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Earthos Lab Forms</h1>
      
      {/* Contact / Prototype Capital Inquiry Form */}
      <form name="contact" method="POST" action="/forms" data-netlify="true" data-netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="contact" />
        <input name="bot-field" />
        <input type="text" name="name" placeholder="Name" />
        <input type="email" name="email" placeholder="Email" />
        <input type="text" name="organization" placeholder="Organization" />
        <input type="text" name="interestType" placeholder="Category" />
        <textarea name="message" placeholder="Message"></textarea>
        <button type="submit">Submit</button>
      </form>

      {/* Newsletter Dispatch Form */}
      <form name="newsletter" method="POST" action="/forms" data-netlify="true" data-netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="newsletter" />
        <input name="bot-field" />
        <input type="email" name="email" placeholder="Email" />
        <button type="submit">Subscribe</button>
      </form>
    </main>
  );
}
