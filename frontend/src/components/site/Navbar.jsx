import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { EnvelopeSimple, ArrowUpRight, CaretDown } from "@phosphor-icons/react";

const aboutLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#stack", label: "Stack" },
    { href: "#industries", label: "Industries" },
];

const links = [
    { href: "#case-studies", label: "Case Studies" },
    { href: "#roi", label: "ROI" },
    { href: "#insights", label: "Insights" },
    { href: "#credentials", label: "Credentials" },
    { href: "#contact", label: "Contact Us" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
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
                        <a
                            href="mailto:connect@hiqanalytix.com"
                            className="group inline-flex items-center gap-1.5 underline decoration-white/35 underline-offset-4 transition-colors hover:text-white hover:decoration-emerald-300"
                            aria-label="Email HARVESTIQ LLP at connect@hiqanalytix.com"
                        >
                            <EnvelopeSimple size={12} weight="bold" /> connect@hiqanalytix.com
                        </a>
                    </div>
                    <div className="flex items-center gap-4 text-white/70">
                        <a
                            href="#credentials"
                            className="hidden items-center gap-1.5 border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75 transition-colors hover:border-emerald-300/60 hover:text-emerald-300 lg:inline-flex"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Startup India recognised
                        </a>
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
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 h-16 lg:px-10">
                    <a href="#home" data-testid="nav-logo" className="flex-shrink-0 min-w-max flex items-center gap-2.5">
                        <img src="/logo.jpeg" alt="HARVESTIQ LLP" className="h-9 w-auto" />
                        <div className="flex flex-col leading-none">
                            <span className="font-display text-lg font-semibold tracking-tight text-neutral-900">
                                HARVESTIQ LLP
                            </span>
                            <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-neutral-700">
                                Analytics Solutions
                            </span>
                        </div>
                    </a>

                    <div className="hidden items-center gap-4 whitespace-nowrap nav-collapse:flex" data-testid="nav-desktop-links">
                        <div
                            className="relative"
                            onMouseEnter={() => setAboutOpen(true)}
                            onMouseLeave={() => setAboutOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => setAboutOpen((value) => !value)}
                                className="group inline-flex items-center gap-1 py-1 text-sm text-neutral-700 transition-colors duration-200 hover:text-neutral-900"
                                aria-expanded={aboutOpen}
                            >
                                About
                                <CaretDown size={13} weight="bold" className={`transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
                                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
                            </button>
                            {aboutOpen && (
                                <div className="absolute left-0 top-full w-48 pt-3">
                                    <div className="border border-neutral-200 bg-white p-2 shadow-xl">
                                        {aboutLinks.map((link) => (
                                            <a
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setAboutOpen(false)}
                                                className="block px-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-brand-light hover:text-brand-dark"
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group relative py-1 text-sm text-neutral-700 transition-colors duration-200 hover:text-neutral-900"
                            >
                                {l.label}
                                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
                            </a>
                        ))}
                        <a
                            href="#contact"
                            data-testid="nav-cta"
                            className="group inline-flex items-center gap-1.5 bg-brand px-4 py-2 text-sm font-medium text-white shadow-md shadow-brand/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-brand/30"
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
                        className="inline-flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-900 nav-collapse:hidden"
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
                    className="h-0.5 origin-left bg-brand"
                />
            </nav>

            {open && (
                <div
                    data-testid="nav-mobile-panel"
                    className="border-t border-neutral-200 bg-white/95 backdrop-blur-xl nav-collapse:block hidden"
                >
                    <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
                        <div className="border-b border-neutral-100 pb-2">
                            <div className="px-0 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">About</div>
                            {aboutLinks.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="block border-t border-neutral-100 py-3 text-base text-neutral-800 hover:text-brand-dark"
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
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
                            className="mt-4 bg-brand px-4 py-3 text-center text-sm font-medium text-white"
                        >
                            Book a demo
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
