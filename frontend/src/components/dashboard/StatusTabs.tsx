"use client";

export interface Tab {
  value: string;
  label: string;
}

export default function StatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            active === tab.value ? "border-ink text-ink" : "border-transparent text-slate hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
