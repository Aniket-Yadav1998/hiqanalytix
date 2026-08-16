import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";

const aboutImg = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxkaXZlcnNlJTIwY29ycG9yYXRlJTIwdGVhbSUyMG1lZXRpbmd8ZW58MHx8fHwxNzg2ODIwOTk3fDA&ixlib=rb-4.1.0&q=85";

const bullets = [
    "Deep specialisation in Microsoft Power Platform, Power BI and RPA.",
    "Delivery pods embedded with your teams — remote, on-site or hybrid.",
    "Governance-first approach with security, data privacy and audit baked in.",
    "Outcome-based engagements with transparent KPIs and reporting.",
];

export default function About() {
    return (
        <section
            id="about"
            data-testid="about-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
        >
            <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:gap-20 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }}
                    className="lg:col-span-5"
                >
                    <div className="relative">
                        <img
                            src={aboutImg}
                            alt="hiqanalytix consulting team collaborating"
                            className="w-full border border-neutral-200 object-cover"
                            loading="lazy"
                        />
                        <div className="absolute -bottom-6 -right-6 hidden border border-neutral-200 bg-white p-5 shadow-[0_10px_40px_-10px_rgba(249,115,22,0.25)] md:block">
                            <div className="font-display text-3xl font-bold text-neutral-900">ISO&nbsp;27001</div>
                            <div className="mt-1 text-xs uppercase tracking-widest text-neutral-500">Aligned processes</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="lg:col-span-7"
                >
                    <span data-testid="about-eyebrow" className="text-xs uppercase tracking-[0.25em] text-orange-600">
                        About hiqanalytix
                    </span>
                    <h2 data-testid="about-heading" className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl">
                        A senior team of data engineers, dashboard designers and automation specialists.
                    </h2>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-800">
                        We are a boutique consulting firm helping enterprise
                        clients rebuild the way they measure, decide and operate. As a
                        specialist Power BI and automation consultancy, we translate
                        messy operational data into decisions leaders can act on the
                        same day — from finance close automation to plant-floor telemetry.
                    </p>

                    <ul data-testid="about-bullets" className="mt-10 grid gap-4 sm:grid-cols-2">
                        {bullets.map((b) => (
                            <li key={b} className="flex items-start gap-3 text-neutral-800">
                                <CheckCircle weight="duotone" size={22} className="mt-0.5 flex-none text-orange-500" />
                                <span className="text-sm leading-relaxed">{b}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
}
