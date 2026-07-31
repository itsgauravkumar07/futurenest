import Link from "next/link";

const columns = [
  {
    title: "Buy & Rent",
    links: [
      { label: "Properties for sale", href: "/properties?listingType=sale" },
      { label: "Properties for rent", href: "/properties?listingType=rental" },
      { label: "Find a property for me", href: "/register?role=buyer" },
    ],
  },
  {
    title: "List with us",
    links: [
      { label: "Sell a property", href: "/register?role=seller" },
      { label: "Rent out a property", href: "/register?role=seller" },
      { label: "Seller plans", href: "/plans" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About FutureNest", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-medium text-ink">FutureNest</p>
          <p className="mt-3 max-w-xs text-sm text-slate">
            A verified lead-generation platform for property sale and rental — connecting sellers and
            landlords with qualified buyers and tenants.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink hover:text-accent-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FutureNest Property. All rights reserved.</p>
          <p>Dehradun, Uttarakhand</p>
        </div>
      </div>
    </footer>
  );
}
