import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ShieldCheck, ChevronRight, MapPin, Building2, Users, ChevronDown, EyeOff, BadgeIndianRupee, Home as HomeIcon } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import FaqAccordion from "@/components/FaqAccordion";
import PricingToggle from "@/components/PricingToggle";
import { getProperties, getPlans, getBlogs } from "@/lib/server-api";
import { collections, heroImage, faqs } from "@/lib/homepage-content";
import { formatDate } from "@/lib/utils";

const pipeline = [
  {
    step: "01",
    title: "You List",
    body: "A seller or landlord lists a sale or rental property — free, no cost to list.",
  },
  {
    step: "02",
    title: "We Verify",
    body: "Our team reviews and approves every listing, and personally contacts every interested buyer or tenant.",
  },
  {
    step: "03",
    title: "We Qualify",
    body: "Only genuine, reachable, serious buyers and tenants are marked qualified — no tyre-kickers.",
  },
  {
    step: "04",
    title: "You Get The Lead",
    body: "We share the qualified contact with you offline, backed by our money-back guarantee.",
  },
];

const differentiators = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    body: "Every property is reviewed by our team before it goes live — nothing publishes automatically.",
  },
  {
    icon: EyeOff,
    title: "Private Access",
    body: "Your identity is only shared with buyers or tenants once our team has qualified their interest.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Qualified Buyers Only",
    body: "We personally verify every enquiry before a lead ever reaches you — no ad spend, no tyre-kickers.",
  },
];

export default async function HomePage() {
  const [{ properties, pagination }, { plans: sellerPlans }, { plans: buyerPlans }, { blogs }] = await Promise.all([
    getProperties({ limit: "6" }),
    getPlans({ audience: "seller" }),
    getPlans({ audience: "buyer" }),
    getBlogs({ limit: "6" }),
  ]);

  return (
    <>
      {/* Hero — full-bleed background photo, dark overlay, overlapping search card */}
      <section className="relative">
  <div className="relative h-[760px] sm:h-[720px] md:h-[640px] lg:h-[700px] w-full overflow-hidden">
    <Image
      src={heroImage}
      alt="Luxury properties in Dehradun"
      fill
      priority
      className="object-cover"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-ink-900/65 via-ink-900/60 to-ink-900/90" />

    {/* Glow */}
    <div className="absolute left-1/2 top-[28%] h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-[120px] sm:h-72 sm:w-72" />

    {/* Bottom Vignette */}
    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-ink-900/40 to-transparent" />

    <div className="container-page relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-paper">

      {/* Location */}
      <p className="eyebrow mb-3 text-xs tracking-[0.18em] text-accent sm:mb-5">
        Dehradun · Sale & Rental
      </p>

      {/* Heading */}
      <h1 className="max-w-5xl text-3xl font-semibold leading-tight text-paper sm:text-4xl md:text-5xl lg:text-6xl">
        Verified Buyers,
        <span className="italic text-accent">
          {" "}
          Elite Assets.
        </span>
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-2xl px-2 text-sm leading-6 text-paper/80 sm:text-base md:mt-5">
        Exclusive properties for verified buyers and serious investors.
      </p>

      {/* Search */}
      <div className="mt-8 w-full sm:mt-10 md:mt-12">
        <form
          action="/properties"
          className="card mx-auto grid max-w-5xl grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,.18)] backdrop-blur-md sm:grid-cols-[2fr_1fr_1fr_auto] sm:p-5"
        >
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-light"
            />

            <input
              name="search"
              placeholder="Keyword (e.g. Modern Villa)"
              className="input h-12 w-full pl-10"
            />
          </div>

          {/* City */}
          <input
            name="city"
            placeholder="City"
            className="input h-12 w-full"
          />

          {/* Property Type */}
          <select
            name="propertyType"
            defaultValue=""
            className="input h-12 w-full"
          >
            <option value="">Property Type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
            <option value="Plot">Plot</option>
            <option value="Commercial Property">Commercial</option>
          </select>

          {/* Button */}
          <button
            type="submit"
            className="btn-accent h-12 w-full transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
          >
            Search
          </button>
        </form>

        {/* Trust Badges */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-paper/80 sm:mt-6 sm:gap-3 sm:text-xs md:gap-5">

          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-leaf" />
            Verified Properties
          </span>

          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-leaf" />
            Qualified Buyers
          </span>

          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            <EyeOff size={14} className="text-leaf" />
            Privacy Protected
          </span>

        </div>
      </div>
    </div>
  </div>
      </section>

      {/*Value props — one real live figure, three honest policy statements
          (deliberately not fabricated vanity metrics)*/}
      <section className="border-y border-line bg-slate-50">
  <div className="container-page py-16 md:py-20">
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {/* Card 1 */}
      <div className="group rounded-2xl border border-line bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <HomeIcon
            size={24}
            className="text-accent-dark"
            strokeWidth={1.75}
          />
        </div>

        <p className="mt-5 font-mono text-3xl text-ink">
          {pagination.total}+
        </p>

        <p className="mt-2 text-sm text-slate">
          Verified Properties
        </p>

      </div>

      {/* Card 2 */}
      <div className="group rounded-2xl border border-line bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <ShieldCheck
            size={24}
            className="text-accent-dark"
            strokeWidth={1.75}
          />
        </div>

        <p className="mt-5 font-mono text-3xl text-ink">
          100%
        </p>

        <p className="mt-2 text-sm text-slate">
          Listings Reviewed
        </p>

      </div>

      {/* Card 3 */}
      <div className="group rounded-2xl border border-line bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <EyeOff
            size={24}
            className="text-accent-dark"
            strokeWidth={1.75}
          />
        </div>

        <p className="mt-5 font-mono text-3xl text-ink">
          Private
        </p>

        <p className="mt-2 text-sm text-slate">
          Contact Details
        </p>

      </div>

      {/* Card 4 */}
      <div className="group rounded-2xl border border-line bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <BadgeIndianRupee
            size={24}
            className="text-accent-dark"
            strokeWidth={1.75}
          />
        </div>

        <p className="mt-5 font-mono text-3xl text-ink">
          Guarantee
        </p>

        <p className="mt-2 text-sm text-slate">
          Money-Back Policy
        </p>

      </div>

    </div>
  </div>
      </section>

      {/* Explore Collections */}
      {/* <section className="border-b border-line">
        <div className="container-page py-16 md:py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow mb-3">Explore Collections</p>
              <h2 className="text-3xl">Curated categories for every kind of buyer</h2>
            </div>
            <Link href="/properties" className="hidden text-sm text-accent-dark hover:underline sm:block">
              View All →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {collections.map((item) => {
              const params = new URLSearchParams();
              if (item.propertyType) params.set("propertyType", item.propertyType);
              if (item.listingType) params.set("listingType", item.listingType);
              return (
                <Link
                  key={item.label}
                  href={`/properties?${params.toString()}`}
                  className="group flex flex-col items-center gap-2.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-full ring-1 ring-line">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section> */}

      <section className="border-b border-line bg-slate-50/50">
  <div className="container-page py-16 md:py-20">
    {/* Header */}
    <div className="flex items-end justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Explore Collections</p>

        <h2 className="text-3xl text-ink">
          Curated categories for every kind of buyer
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate">
          Discover premium residential and commercial properties tailored to
          your investment goals.
        </p>
      </div>

      <Link
        href="/properties"
        className="hidden items-center rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-accent-dark shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-md sm:flex"
      >
        View All →
      </Link>
    </div>

    {/* Categories */}
    <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {collections.map((item) => {
        const params = new URLSearchParams();

        if (item.propertyType)
          params.set("propertyType", item.propertyType);

        if (item.listingType)
          params.set("listingType", item.listingType);

        return (
          <Link
            key={item.label}
            href={`/properties?${params.toString()}`}
            className="group"
          >
            <div className="rounded-2xl border border-line bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">

              <div className="relative mx-auto aspect-square w-28 overflow-hidden rounded-full ring-2 ring-line transition-all duration-300 group-hover:ring-accent/30">

                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

              </div>

              <h3 className="mt-5 text-sm font-semibold text-ink transition-colors group-hover:text-accent-dark">
                {item.label}
              </h3>

            </div>
          </Link>
        );
      })}
    </div>

    {/* Mobile Button */}

    <div className="mt-10 flex justify-center sm:hidden">
      <Link
        href="/properties"
        className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-accent-dark shadow-sm transition hover:shadow-md"
      >
        View All Properties →
      </Link>
    </div>
  </div>
      </section>

      {/* Signature Estates — live data */}
      {properties.length > 0 && (
        <section className="border-b border-line bg-white">
          <div className="container-page py-16 md:py-20">
            <p className="eyebrow mb-3 text-center">Signature Estates</p>
            <h2 className="text-center text-3xl">Hand-selected listings, fully verified</h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div key={property._id} className="relative">
                  <span className="pill pill-approved absolute left-3 top-3 z-10">Verified</span>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/properties" className="btn-outline">
                Explore All Collections
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Redefining Real Estate Lead Generation */}
      <section className="border-b border-line bg-slate-50/50">
  <div className="container-page py-16 md:py-20">
    {/* Section Header */}
    <div className="mx-auto max-w-3xl text-center">
      <p className="eyebrow mb-3">Why FutureNest</p>

      <h2 className="text-3xl text-ink">
        Redefining Real Estate Lead Generation
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate">
        Stop wasting time on unverified enquiries. We connect property owners
        with genuine buyers and tenants so you can focus on closing deals
        instead of filtering leads.
      </p>
    </div>

    {/* Cards */}

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {differentiators.map((item) => (
        <div
          key={item.title}
          className="group rounded-2xl border border-line bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg"
        >
          {/* Icon */}

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 transition-colors duration-300 group-hover:bg-accent/15">
            <item.icon
              size={24}
              className="text-accent-dark"
              strokeWidth={1.75}
            />
          </div>

          {/* Title */}

          <h3 className="mt-6 text-lg font-medium text-ink">
            {item.title}
          </h3>

          {/* Description */}

          <p className="mt-3 text-sm leading-7 text-slate">
            {item.body}
          </p>

          {/* Accent Line */}

          <div className="mt-6 h-1 w-10 rounded-full bg-accent transition-all duration-300 group-hover:w-16" />
        </div>
      ))}
    </div>
  </div>
      </section>

      {/* The FutureNest Process — dark full-bleed, real 4-step business pipeline */}
      <section className="bg-ink">
        <div className="container-page py-16 md:py-20">

          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-3 text-accent">
              How It Works
            </p>

            <h2 className="text-3xl text-paper">
              The FutureNest Process
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-paper/70">
              We replace endless browsing with a verified, intent-matching system
              designed for serious buyers, sellers, tenants and landlords.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-4">
            {pipeline.map((item, index) => (
              <div key={item.step} className="relative">

                {/* Arrow */}
                {index !== pipeline.length - 1 && (
                  <div className="absolute left-full top-1/2 z-10 hidden w-12 -translate-y-1/2 lg:flex items-center justify-center">
                    <div className="h-px flex-1 bg-white/20" />
                    <ChevronRight
                      size={18}
                      className="ml-1 text-accent"
                    />
                  </div>
                )}

                {/* Card */}
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/10 hover:shadow-xl">

                  {/* Step Badge */}
                  <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    Step {item.step}
                  </span>

                  <h3 className="mt-5 text-xl font-medium text-paper">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-paper/70">
                    {item.body}
                  </p>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Tailored Success Plans — live plan data, seller/buyer toggle */}
      {/* {(sellerPlans.length > 0 || buyerPlans.length > 0) && (
        <section className="border-b border-line bg-white">
          <div className="container-page py-16 md:py-20">
            <p className="eyebrow mb-3 text-center">Pricing</p>
            <h2 className="text-center text-3xl">Tailored Success Plans</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate">
              Pay for qualified outcomes, not exposure — whether you're listing a property or looking
              for one.
            </p>

            <div className="mt-10">
              <PricingToggle sellerPlans={sellerPlans} buyerPlans={buyerPlans} />
            </div>
          </div>
        </section>
      )} */}

      {(sellerPlans.length > 0 || buyerPlans.length > 0) && (
        <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-slate-50/40 to-white">

          {/* Background Decoration */}
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />

          <div className="container-page relative py-16 md:py-20">

            {/* Header */}
            <div className="mx-auto max-w-3xl text-center">

              <p className="eyebrow mb-3">
                Pricing
              </p>

              <h2 className="text-3xl">
                Tailored Success Plans
              </h2>

              <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-accent" />

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate">
                Pay for qualified outcomes, not exposure. Choose a plan that fits
                whether you're listing properties or searching for your next home.
              </p>

            </div>

            {/* Pricing Toggle */}
            <div className="mt-14">
              <PricingToggle
                sellerPlans={sellerPlans}
                buyerPlans={buyerPlans}
              />
            </div>

          </div>
        </section>
      )}

      {/* Expert Guidance — honest FAQ */}
      <section className="relative overflow-hidden border-b border-line bg-slate-50/50">

  {/* Background Decoration */}
  <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/5 blur-[120px]" />

  <div className="container-page relative py-16 md:py-20">

    {/* Header */}
    <div className="mx-auto max-w-3xl text-center">

      <p className="eyebrow mb-3">
        Expert Guidance
      </p>

      <h2 className="text-3xl text-ink">
        Frequently Asked Questions
      </h2>

      <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-accent" />

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate">
        Everything you need to know about buying, selling, renting, and using
        FutureNest's verified lead generation platform.
      </p>

    </div>

    {/* FAQ */}

    <div className="mx-auto mt-14 max-w-3xl">
      <FaqAccordion items={faqs} />
    </div>

  </div>
      </section>

      {/* CTA banner */}
      {/* <section className="bg-ink">
        <div className="container-page py-16 text-center text-paper md:py-20">
          <h2 className="mx-auto max-w-xl text-3xl text-paper">Ready to transact at the speed of trust?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-paper/70">
            Join a platform where every listing is verified and every lead is qualified.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register?role=seller" className="btn-accent">
              List Your Property <ArrowRight size={16} />
            </Link>
            <Link
              href="/properties"
              className="btn-outline border-paper text-paper hover:border-accent hover:text-accent"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </section> */}

      <section className="relative overflow-hidden bg-ink">
  {/* Background Glow */}
  <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

  <div className="container-page py-16 md:py-20">

    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-8 py-14 text-center backdrop-blur-sm md:px-14 md:py-16">

      {/* Decorative circles */}
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative">

        <p className="eyebrow mb-3 text-accent">
          Get Started Today
        </p>

        <h2 className="mx-auto max-w-2xl text-3xl text-paper">
          Ready to transact at the speed of trust?
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-paper/70">
          Join a platform where every listing is verified and every lead is
          qualified. Experience a smarter way to buy, sell, and rent property.
        </p>

        {/* Trust Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-paper/80">
            ✓ Verified Listings
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-paper/80">
            ✓ Genuine Buyers
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-paper/80">
            ✓ Secure Transactions
          </span>

        </div>

        {/* Buttons */}

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <Link
            href="/register?role=seller"
            className="btn-accent"
          >
            List Your Property
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/properties"
            className="btn-outline border-paper text-paper hover:border-accent hover:text-accent"
          >
            Browse Collection
          </Link>

        </div>

      </div>

    </div>

  </div>
      </section>

      {/* Latest Insights — live blog data */}
      {/* {blogs.length > 0 && (
        <section className="bg-white">
          <div className="container-page py-16 md:py-20">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow mb-3">Latest Insights</p>
                <h2 className="text-3xl">Stay ahead with market analysis and guides</h2>
              </div>
              <Link href="/blog" className="hidden text-sm text-accent-dark hover:underline sm:block">
                View All Articles →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link key={blog._id} href={`/blog/${blog.slug}`} className="card group overflow-hidden">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-50">
                    {blog.coverImage?.url ? (
                      <Image
                        src={blog.coverImage.url}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-light">
                        FutureNest
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {blog.categories?.[0] && <p className="eyebrow mb-2">{blog.categories[0]}</p>}
                    <h3 className="line-clamp-2 text-base font-medium text-ink">{blog.title}</h3>
                    <p className="mt-2 text-xs text-slate">{formatDate(blog.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {blogs.length > 0 && (
  <section className="border-t border-line bg-slate-50/50">
    <div className="container-page py-16 md:py-20">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">
            Latest Insights
          </p>

          <h2 className="text-3xl">
            Stay ahead with market analysis and guides
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate">
            Explore expert advice, investment trends, buying guides, and
            practical tips to make smarter real estate decisions.
          </p>
        </div>

        <Link
          href="/blog"
          className="hidden rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-accent-dark shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-md sm:flex"
        >
          View All Articles →
        </Link>
      </div>

      {/* Blog Cards */}

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        {blogs.map((blog) => (

          <Link
            key={blog._id}
            href={`/blog/${blog.slug}`}
            className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >

            {/* Image */}

            <div className="relative aspect-[16/10] overflow-hidden">

              {blog.coverImage?.url ? (

                <Image
                  src={blog.coverImage.url}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

              ) : (

                <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate">
                  FutureNest
                </div>

              )}

              {/* Category */}

              {blog.categories?.[0] && (
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow">
                  {blog.categories[0]}
                </span>
              )}

            </div>

            {/* Content */}

            <div className="p-6">

              <h3 className="line-clamp-2 text-lg font-medium text-ink transition-colors group-hover:text-accent-dark">
                {blog.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate">
                <span>{formatDate(blog.publishedAt)}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>

              <div className="mt-6 flex items-center font-medium text-accent-dark transition-all group-hover:gap-3">

                <span className="text-sm">
                  Read Article
                </span>

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />

              </div>

            </div>

          </Link>

        ))}

      </div>

      {/* Mobile Button */}

      <div className="mt-10 flex justify-center sm:hidden">
        <Link
          href="/blog"
          className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium shadow-sm transition hover:shadow-md"
        >
          View All Articles
        </Link>
      </div>

    </div>
  </section>
)}
    </>
  );
}
