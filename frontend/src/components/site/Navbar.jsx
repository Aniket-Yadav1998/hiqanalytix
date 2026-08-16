import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { EnvelopeSimple, PhoneCall, ArrowUpRight } from "@phosphor-icons/react";

const links = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#stack", label: "Stack" },
    { href: "#case-studies", label: "Case Studies" },
    { href: "#roi", label: "ROI" },
    { href: "#industries", label: "Industries" },
    { href: "#insights", label: "Insights" },
    { href: "#contact", label: "Contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const progressX = useSpring(scrollYProgress, { stiffness: 260, damping: 30 });

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header data-testid="site-navbar" className="fixed inset-x-0 top-0 z-50">
            {/* Utility strip */}
            <div
                data-testid="nav-utility"
                className={`hidden overflow-hidden border-b border-neutral-200 bg-neutral-900 text-white transition-all duration-300 md:block ${
                    scrolled ? "max-h-0 opacity-0" : "max-h-16 opacity-100"
                }`}
            >
                <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-[11px] lg:px-10">
                    <div className="flex items-center gap-6 text-white/80">
                        <a href="mailto:hello@hiqanalytix.com" className="inline-flex items-center gap-1.5 hover:text-white">
                            <EnvelopeSimple size={12} weight="bold" /> hello@hiqanalytix.com
                        </a>
                        <a href="tel:+15550104477" className="inline-flex items-center gap-1.5 hover:text-white">
                            <PhoneCall size={12} weight="bold" /> +1 (555) 010-4477
                        </a>
                    </div>
                    <div className="flex items-center gap-4 text-white/70">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Global delivery · GMT / IST / EST
                        </span>
                        <a href="#insights" className="inline-flex items-center gap-1 hover:text-white">
                            Latest field notes <ArrowUpRight size={11} weight="bold" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <nav
                className={`transition-colors duration-300 ${
                    scrolled
                        ? "border-b border-neutral-200 bg-white/85 shadow-sm backdrop-blur-xl"
                        : "border-b border-transparent bg-white/60 backdrop-blur"
                }`}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
                    <a href="#home" data-testid="nav-logo" className="group flex items-center gap-2.5">
                        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
                            <rect x="0" y="0" width="40" height="40" fill="#F97316" />
                            <path d="M9 30 V10 H14 V18 H22 V10 H27 V30 H22 V22 H14 V30 Z" fill="white" />
                            <circle cx="32" cy="10" r="3.2" fill="white" />
                        </svg>
                        <div className="flex flex-col leading-none">
                            <span className="font-display text-lg font-semibold tracking-tight text-neutral-900">
                                hiqanalytix
                            </span>
                            <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-neutral-500">
                                Power BI · Automation
                            </span>
                        </div>
                    </a>

                    <div className="hidden items-center gap-7 md:flex">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group relative py-1 text-sm text-neutral-700 transition-colors duration-200 hover:text-neutral-900"
                            >
                                {l.label}
                                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                            </a>
                        ))}
                        <a
                            href="#contact"
                            data-testid="nav-cta"
                            className="inline-flex items-center gap-1.5 bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-500/30"
                        >
                            Book a demo <ArrowUpRight size={14} weight="bold" />
                        </a>
                    </div>

                    <button
                        type="button"
                        data-testid="nav-menu-toggle"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-900 md:hidden"
                    >
                        <span className="sr-only">Menu</span>
                        <div className="space-y-1.5">
                            <span className={`block h-0.5 w-5 bg-neutral-900 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
                            <span className={`block h-0.5 w-5 bg-neutral-900 transition-opacity ${open ? "opacity-0" : ""}`} />
                            <span className={`block h-0.5 w-5 bg-neutral-900 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                        </div>
                    </button>
                </div>

                {/* Scroll progress */}
                <motion.div
                    data-testid="nav-scroll-progress"
                    style={{ scaleX: progressX }}
                    className="h-0.5 origin-left bg-orange-500"
                />
            </nav>

            {open && (
                <div
                    data-testid="nav-mobile-panel"
                    className="border-t border-neutral-200 bg-white/95 backdrop-blur-xl md:hidden"
                >
                    <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className="border-b border-neutral-100 py-4 text-base text-neutral-800 hover:text-neutral-900"
                            >
                                {l.label}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            data-testid="nav-mobile-cta"
                            className="mt-4 bg-orange-500 px-4 py-3 text-center text-sm font-medium text-white"
                        >
                            Book a demo
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
