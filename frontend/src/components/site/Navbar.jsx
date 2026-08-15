import React, { useEffect, useState } from "react";

const links = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#industries", label: "Industries" },
    { href: "#contact", label: "Contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="site-navbar"
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                scrolled
                    ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
                    : "border-b border-transparent bg-transparent"
            }`}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
                <a
                    href="#home"
                    data-testid="nav-logo"
                    className="group flex items-center gap-2"
                >
                    <span className="grid h-8 w-8 place-items-center border border-white/20 bg-white/5 font-display text-sm font-bold text-white">
                        hq
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight text-white">
                        hiqanalytix
                    </span>
                </a>

                <div className="hidden items-center gap-8 md:flex">
                    {links.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            data-testid={`nav-link-${l.label.toLowerCase()}`}
                            className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                        >
                            {l.label}
                        </a>
                    ))}
                    <a
                        href="#contact"
                        data-testid="nav-cta"
                        className="bg-[#0055FF] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0044cc]"
                    >
                        Get in touch
                    </a>
                </div>

                <button
                    type="button"
                    data-testid="nav-menu-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden inline-flex h-9 w-9 items-center justify-center border border-white/20 text-white"
                >
                    <span className="sr-only">Menu</span>
                    <div className="space-y-1.5">
                        <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                    </div>
                </button>
            </nav>

            {open && (
                <div
                    data-testid="nav-mobile-panel"
                    className="border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
                >
                    <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                                className="border-b border-white/5 py-4 text-base text-white/80 hover:text-white"
                            >
                                {l.label}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            data-testid="nav-mobile-cta"
                            className="mt-4 bg-[#0055FF] px-4 py-3 text-center text-sm font-medium text-white"
                        >
                            Get in touch
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
