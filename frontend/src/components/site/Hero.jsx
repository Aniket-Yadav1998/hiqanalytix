import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import HeroAutomationFlow from "@/components/site/HeroAutomationFlow";

const rotators = [
    "Power BI dashboards",
    "Power Automate flows",
    "Copilot Studio agents",
    "Microsoft Fabric pipelines",
    "Enterprise Power Apps",
];

export default function Hero() {
    const [idx, setIdx] = React.useState(0);
    React.useEffect(() => {
        const t = setInterval(() => setIdx((i) => (i + 1) % rotators.length), 2400);
        return () => clearInterval(t);
    }, []);

    return (
        <section
            id="home"
            data-testid="hero-section"
            className="relative isolate overflow-hidden bg-white pt-28"
        >
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 hero-glow" />
                <div className="absolute inset-0 hero-grid opacity-60" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
                {/* Animated orbiting dots */}
                <motion.span
                    className="absolute left-[10%] top-40 h-2 w-2 rounded-full bg-brand"
                    animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                    className="absolute right-[42%] top-64 h-1.5 w-1.5 rounded-full bg-neutral-900"
                    animate={{ y: [0, -14, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                />
                <motion.span
                    className="absolute left-[8%] bottom-40 h-1.5 w-1.5 rounded-full bg-brand"
                    animate={{ y: [0, -16, 0], opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                />
            </div>

            <div className="mx-auto grid max-w-7xl gap-14 px-6 pt-16 pb-28 md:pt-24 md:pb-40 lg:grid-cols-12 lg:gap-8 lg:px-10">
                {/* LEFT — headline & CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:col-span-7 lg:pr-4"
                >
                    <span
                        data-testid="hero-eyebrow"
                        className="inline-flex items-center gap-2 border border-brand-light bg-brand-light px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-brand-dark"
                    >
                        <Sparkle size={14} weight="fill" className="text-brand" />
                        Microsoft Power Platform consulting firm
                    </span>

                    <h1
                        data-testid="hero-heading"
                        className="mt-8 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-neutral-900 md:text-7xl lg:text-[5.25rem]"
                    >
                        Your trust
                        <br />
                        is our{" "}
                        <span className="relative inline-block text-brand">
                            responsibility.
                            <motion.span
                                aria-hidden
                                className="absolute -bottom-2 left-0 h-1 w-full origin-left bg-brand/80"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </span>
                    </h1>

                    {/* Rotating service line */}
                    <div className="mt-8 flex flex-wrap items-baseline gap-3 text-lg md:text-xl">
                        <span className="text-neutral-800">We ship enterprise-grade</span>
                        <span
                            data-testid="hero-rotator"
                            className="relative inline-flex h-8 min-w-[220px] items-baseline overflow-hidden md:h-9"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={rotators[idx]}
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -30, opacity: 0 }}
                                    transition={{ duration: 0.45 }}
                                    className="font-display font-semibold text-brand"
                                >
                                    {rotators[idx]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </div>

                    <p
                        data-testid="hero-subheading"
                        className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-800 md:text-lg"
                    >
                        for Financial, Automotive, Engineering, Energy and Health leaders
                        who need decisions in hours, not months.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <a
                            href="#contact"
                            data-testid="hero-cta-primary"
                            className="group inline-flex items-center gap-2 bg-brand px-6 py-3.5 font-medium text-white shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand-dark hover:shadow-brand/30"
                        >
                            Start a conversation
                            <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
                        </a>
                        <a
                            href="#roi"
                            data-testid="hero-cta-secondary"
                            className="inline-flex items-center gap-2 border border-neutral-900 px-6 py-3.5 font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
                        >
                            Calculate your ROI
                        </a>
                    </div>

                    {/* Trust ribbons */}
                    <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-neutral-200 pt-8 text-neutral-700">
                        {[
                            "Microsoft Solutions Partner",
                            "ISO 27001-aligned",
                            "GDPR & HIPAA-aware",
                        ].map((t) => (
                            <span key={t} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Metrics */}
                    <div
                        data-testid="hero-metrics"
                        className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4"
                    >
                        {[
                            { k: "5", v: "Industries served" },
                            { k: "40+", v: "Dashboards shipped" },
                            { k: "99.9%", v: "Uptime commitment" },
                            { k: "24/7", v: "Support coverage" },
                        ].map((m, i) => (
                            <motion.div
                                key={m.v}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                            >
                                <div className="font-display text-2xl font-bold text-neutral-900 md:text-3xl">
                                    {m.k}
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-widest text-neutral-700">
                                    {m.v}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT — Animated Automation Flow */}
                <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-end">
                    <HeroAutomationFlow />
                </div>
            </div>
        </section>
    );
}
