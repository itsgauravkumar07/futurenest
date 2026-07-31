import Link from "next/link";
import { ShieldCheck, EyeOff, BadgeIndianRupee, Users } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "We verify before we deliver",
    body: "Every property is reviewed by our team before it goes live. Every buyer or tenant who shows interest is personally contacted and qualified before a seller ever hears from them.",
  },
  {
    icon: EyeOff,
    title: "Privacy by design",
    body: "We never publish a seller or landlord's phone number, WhatsApp, or email. Every enquiry is routed through FutureNest — you decide who you actually talk to.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Aligned incentives",
    body: "We don't make money from ads or listing fees. We earn by delivering leads that convert — so a money-back guarantee applies if we fall short of what you paid for.",
  },
  {
    icon: Users,
    title: "One platform, every role",
    body: "Whether you're an individual owner, landlord, agent, or brokerage, you get the same dashboard — what changes is your plan, not your access.",
  },
];

export default function AboutPage() {
  return (

    <div className="container-page py-16 md:py-20">

  {/* Hero */}

  <div className="mx-auto max-w-4xl text-center">

    <p className="eyebrow mb-4">
      About FutureNest
    </p>

    <h1 className="text-4xl leading-tight md:text-5xl">
      A lead-generation platform for real estate —
      <span className="italic text-accent-dark">
        {" "}not a listing site.
      </span>
    </h1>

    <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-accent" />

    <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate">
      Most property websites make money whether or not you ever get a genuine
      buyer or tenant. FutureNest works differently. We succeed only when we
      deliver qualified leads, making verification and trust the foundation of
      everything we do.
    </p>

  </div>

  {/* Mission Card */}

  <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-line bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm md:p-10">

    <div className="grid gap-10 md:grid-cols-2">

      <div>

        <p className="eyebrow mb-3">
          Our Mission
        </p>

        <h2 className="text-2xl">
          Building trust into every property transaction.
        </h2>

      </div>

      <p className="text-sm leading-7 text-slate">
        FutureNest eliminates fake listings, spam enquiries and wasted
        conversations by matching verified property owners with genuine buyers
        and tenants. Every interaction is designed to save time and improve
        conversion.
      </p>

    </div>

  </div>

  {/* Values */}

  <div className="mt-16">

    <div className="text-center">

      <p className="eyebrow mb-3">
        Why Choose Us
      </p>

      <h2 className="text-3xl">
        Built around quality, not quantity.
      </h2>

    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-2">

      {pillars.map((item) => (

        <div
          key={item.title}
          className="group rounded-2xl border border-line bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
        >

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">

            <item.icon
              size={24}
              className="text-accent-dark"
              strokeWidth={1.75}
            />

          </div>

          <h2 className="mt-6 text-xl">
            {item.title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate">
            {item.body}
          </p>

        </div>

      ))}

    </div>

  </div>

  {/* CTA */}

  <div className="relative mt-20 overflow-hidden rounded-3xl border border-line bg-ink px-8 py-12 text-paper md:px-12">

    <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-accent/10 blur-[120px]" />

    <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

      <div className="max-w-xl">

        <p className="eyebrow mb-3 text-accent">
          Get Started
        </p>

        <h2 className="text-3xl text-paper">
          Have a property, or looking for one?
        </h2>

        <p className="mt-4 text-sm leading-7 text-paper/70">
          Join FutureNest today and connect with verified buyers, sellers,
          landlords and tenants through a trusted platform.
        </p>

      </div>

      <div className="flex flex-wrap gap-4">

        <Link
          href="/register?role=seller"
          className="btn-accent"
        >
          List a Property
        </Link>

        <Link
          href="/properties"
          className="btn-outline border-paper text-paper hover:border-accent hover:text-accent"
        >
          Browse Properties
        </Link>

      </div>

    </div>

  </div>

</div>
  );
}
