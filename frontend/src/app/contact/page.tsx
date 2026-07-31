"use client";

import { useState, FormEvent } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

const CONTACT_EMAIL = "[email protected]";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container-page py-16 md:py-20">

  {/* Header */}

  <div className="mx-auto mb-14 max-w-3xl text-center">

    <p className="eyebrow mb-3">
      Contact
    </p>

    <h1 className="text-4xl">
      Talk to the FutureNest Team
    </h1>

    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate">
      Questions about a property, pricing, or how FutureNest works?
      We&apos;re here to help.
    </p>

  </div>

  <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">

    {/* LEFT SIDEBAR */}

    <div className="space-y-6">

      {/* Contact Card */}

      <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">

        <h2 className="text-xl">
          Contact Information
        </h2>

        <p className="mt-2 text-sm text-slate">
          Reach out using any of the methods below.
        </p>

        <div className="mt-8 space-y-6">

          {/* Email */}

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Mail
                size={18}
                className="text-accent-dark"
              />
            </div>

            <div>

              <p className="font-medium text-ink">
                Email
              </p>

              <p className="mt-1 text-sm text-slate">
                {CONTACT_EMAIL}
              </p>

            </div>

          </div>

          <div className="border-t border-line" />

          {/* Phone */}

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Phone
                size={18}
                className="text-accent-dark"
              />
            </div>

            <div>

              <p className="font-medium text-ink">
                Phone
              </p>

              <p className="mt-1 text-sm text-slate">
                +91 00000 00000
              </p>

            </div>

          </div>

          <div className="border-t border-line" />

          {/* Address */}

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <MapPin
                size={18}
                className="text-accent-dark"
              />
            </div>

            <div>

              <p className="font-medium text-ink">
                Office
              </p>

              <p className="mt-1 text-sm text-slate">
                Dehradun, Uttarakhand
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Trust Card */}

      <div className="rounded-3xl bg-ink p-7 text-paper">

        <p className="eyebrow text-accent">
          Response Time
        </p>

        <h3 className="mt-4 text-xl text-paper">
          Usually within 24 hours.
        </h3>

        <p className="mt-3 text-sm leading-7 text-paper/70">
          Every enquiry is reviewed by our team to ensure you receive
          the right guidance and a helpful response.
        </p>

      </div>

    </div>

    {/* FORM */}

    <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">

      <h2 className="text-2xl">
        Send us a message
      </h2>

      <p className="mt-2 text-sm text-slate">
        Fill out the form below and we&apos;ll get back to you shortly.
      </p>

      <div className="my-7 h-px bg-line" />

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <div>

          <label
            htmlFor="name"
            className="label"
          >
            Name
          </label>

          <input
            id="name"
            required
            className="input mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

        </div>

        <div>

          <label
            htmlFor="email"
            className="label"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            required
            className="input mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

        </div>

        <div>

          <label
            htmlFor="message"
            className="label"
          >
            Message
          </label>

          <textarea
            id="message"
            rows={6}
            required
            className="input mt-2 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          Send Message
        </button>

        <p className="text-center text-xs text-slate-light">
          Your default email application will open with your message ready to send.
        </p>

      </form>

    </div>

  </div>

    </div>
  );
}
