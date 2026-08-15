import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const bg = "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxkYXRhJTIwbmV0d29yayUyMHZpc3VhbGl6YXRpb258ZW58MHx8fHwxNzg2ODIwOTk3fDA&ixlib=rb-4.1.0&q=85";

export default function Hero() {
    return (
        <section
            id="home"
            data-testid="hero-section"
            className="relative isolate overflow-hidden bg-[#0A0A0C] noise-overlay"
        >
            <div className="absolute inset-0 -z-10">
                <img
                    src={bg}
                    alt="Enterprise data network visualization"
                    className="h-full w-full object-cover opacity-40"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C]/60 via-[#0A0A0C]/80 to-[#0A0A0C]" />
                <div className="absolute inset-0 hero-grid opacity-40" />
            </div>

            <div className="mx-auto max-w-7xl px-6 pt-40 pb-28 md:pt-52 md:pb-40 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl"
                >
                    <span
                        data-testid="hero-eyebrow"
                        className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/70"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        Enterprise Data & Automation Consulting
                    </span>

                    <h1
                        data-testid="hero-heading"
                        className="mt-8 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
                    >
                        Your trust
                        <br />
                        is our
                        <span className="text-[#0055FF]"> responsibility</span>.
                    </h1>

                    <p
                        data-testid="hero-subheading"
                        className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
                    >
                        hiqanalytix is a technology services partner delivering
                        Microsoft Power Platform, Power BI dashboards and intelligent
                        automation for the world&apos;s most demanding industries.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <a
                            href="#contact"
                            data-testid="hero-cta-primary"
                            className="group inline-flex items-center gap-2 bg-[#0055FF] px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-[#0044cc]"
                        >
                            Start a conversation
                            <ArrowRight
                                size={18}
                                weight="bold"
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </a>
                        <a
                            href="#services"
                            data-testid="hero-cta-secondary"
                            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/5"
                        >
                            Explore services
                        </a>
                    </div>

                    <div
                        data-testid="hero-metrics"
                        className="mt-20 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-10 md:grid-cols-4"
                    >
                        {[
                            { k: "5", v: "Industries served" },
                            { k: "40+", v: "Dashboards shipped" },
                            { k: "99.9%", v: "Uptime commitment" },
                            { k: "24/7", v: "Support coverage" },
                        ].map((m) => (
                            <div key={m.v}>
                                <div className="font-display text-3xl font-bold text-white md:text-4xl">
                                    {m.k}
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-widest text-white/50">
                                    {m.v}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
