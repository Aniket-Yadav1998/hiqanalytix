import React from "react";

const nav = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Stack", href: "#stack" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "ROI Calculator", href: "#roi" },
    { label: "Industries", href: "#industries" },
    { label: "Credentials", href: "#credentials" },
    { label: "Contact Us", href: "#contact" },
];

const services = ["Power Platform", "Power BI Dashboards", "Business Automation", "Agentic AI", "RPA"];
const industries = ["Financial", "Automotive", "Engineering", "Energy", "Health"];

export default function Footer() {
    return (
        <footer
            data-testid="site-footer"
            className="relative border-t border-neutral-200 bg-neutral-50 pt-20 pb-10"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-2">
                            <img src="/logo.jpeg" alt="HARVESTIQ LLP" className="h-9 w-auto object-contain" />
                            <span className="font-display text-xl font-semibold text-neutral-900">
                                HARVESTIQ LLP
                            </span>
                        </div>
                        <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
                            HARVESTIQ LLP is a boutique enterprise consulting firm
                            delivering Microsoft Power Platform, Power BI dashboards and
                            intelligent automation for regulated industries — Financial,
                            Automotive, Engineering, Energy and Health.
                        </p>
                        <p className="mt-6 font-display text-lg text-neutral-800">
                            Your trust is our responsibility.
                        </p>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500">Navigate</h4>
                        <ul className="mt-4 space-y-3">
                            {nav.map((l) => (
                                <li key={l.href}>
                                    <a
                                        href={l.href}
                                        data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="text-sm text-neutral-700 hover:text-brand"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500">Services</h4>
                        <ul className="mt-4 space-y-3">
                            {services.map((l) => (
                                <li key={l} className="text-sm text-neutral-700">{l}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-500">Industries</h4>
                        <ul className="mt-4 space-y-3">
                            {industries.map((l) => (
                                <li key={l} className="text-sm text-neutral-700">{l}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 md:flex-row md:items-center">
                    <span>© {new Date().getFullYear()} HARVESTIQ LLP. All rights reserved.</span>
                    <span data-testid="footer-tagline">Built for enterprise. Trusted by design.</span>
                </div>
            </div>
        </footer>
    );
}
