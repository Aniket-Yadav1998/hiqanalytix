import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export default function Hero() {
    return (
        <section
            id="home"
            data-testid="hero-section"
            className="relative isolate overflow-hidden bg-white"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 hero-glow" />
                <div className="absolute inset-0 hero-grid opacity-70" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
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
                        className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-orange-700"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Enterprise Data & Automation Consulting
                    </span>

                    <h1
                        data-testid="hero-heading"
                        className="mt-8 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-neutral-900 md:text-7xl lg:text-8xl"
                    >
                        Your trust
                        <br />
                        is our
                        <span className="text-orange-500"> responsibility</span>.
                    </h1>

                    <p
                        data-testid="hero-subheading"
                        className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600 md:text-xl"
                    >
                        hiqanalytix is a technology services partner delivering
                        Microsoft Power Platform, Power BI dashboards and intelligent
                        automation for the world&apos;s most demanding industries.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <a
                            href="#contact"
                            data-testid="hero-cta-primary"
                            className="group inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-orange-600"
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
                            className="inline-flex items-center gap-2 border border-neutral-300 px-6 py-3.5 font-medium text-neutral-900 transition-colors duration-200 hover:border-neutral-900 hover:bg-neutral-50"
                        >
                            Explore services
                        </a>
                    </div>

                    <div
                        data-testid="hero-metrics"
                        className="mt-20 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-8 border-t border-neutral-200 pt-10 md:grid-cols-4"
                    >
                        {[
                            { k: "5", v: "Industries served" },
                            { k: "40+", v: "Dashboards shipped" },
                            { k: "99.9%", v: "Uptime commitment" },
                            { k: "24/7", v: "Support coverage" },
                        ].map((m) => (
                            <div key={m.v}>
                                <div className="font-display text-3xl font-bold text-neutral-900 md:text-4xl">
                                    {m.k}
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-widest text-neutral-500">
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
