import React from "react";
import { motion } from "framer-motion";
import { Stack, ChartBar, Robot, ArrowUpRight } from "@phosphor-icons/react";

const services = [
    {
        key: "power-platform",
        icon: Stack,
        title: "Power Platform",
        tagline: "Build custom low-code business apps",
        body: "Model-driven and canvas apps, Dataverse architecture, ALM pipelines and enterprise governance — engineered to scale beyond the departmental prototype.",
        bullets: ["Canvas & model-driven apps", "Dataverse & Copilot Studio", "ALM & solution governance"],
        span: "md:col-span-6 lg:col-span-7",
    },
    {
        key: "power-bi",
        icon: ChartBar,
        title: "Power BI Dashboards",
        tagline: "Decision-grade analytics, not decoration",
        body: "Semantic models, executive dashboards and paginated reports designed by data storytellers — with performance tuning that actually holds up in production.",
        bullets: ["Semantic modeling & DAX", "Executive & operational dashboards", "Row-level security & governance"],
        span: "md:col-span-6 lg:col-span-5",
    },
    {
        key: "automations",
        icon: Robot,
        title: "Automations",
        tagline: "RPA + workflow orchestration",
        body: "Power Automate, desktop RPA and cross-system orchestration that replace repetitive operational work — measured in hours reclaimed, not scripts shipped.",
        bullets: ["Power Automate flows", "Desktop RPA (attended / unattended)", "System integration & APIs"],
        span: "md:col-span-12 lg:col-span-12",
    },
];

export default function Services() {
    return (
        <section
            id="services"
            data-testid="services-section"
            className="relative border-t border-neutral-100 bg-neutral-50 py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5">
                        <span data-testid="services-eyebrow" className="text-xs uppercase tracking-[0.25em] text-orange-600">
                            What we do
                        </span>
                        <h2 data-testid="services-heading" className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl">
                            Three practices.
                            <br />
                            One outcome.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-lg leading-relaxed text-neutral-800 lg:col-span-7 lg:pt-4">
                        We specialise on the Microsoft data & automation stack because
                        depth beats breadth. Every engagement is delivered by senior
                        practitioners — no learning on your invoice.
                    </p>
                </div>

                <div data-testid="services-grid" className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-12">
                    {services.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.article
                                key={s.key}
                                data-testid={`service-card-${s.key}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className={`group relative flex flex-col justify-between overflow-hidden border border-neutral-200 bg-white p-8 transition-colors duration-300 hover:border-orange-400 md:p-10 ${s.span}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="inline-flex h-12 w-12 items-center justify-center border border-orange-200 bg-orange-50">
                                            <Icon weight="duotone" size={26} className="text-orange-500" />
                                        </div>
                                        <ArrowUpRight
                                            size={22}
                                            weight="bold"
                                            className="text-neutral-300 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange-500"
                                        />
                                    </div>
                                    <h3 className="mt-8 font-display text-2xl font-bold text-neutral-900 md:text-3xl">
                                        {s.title}
                                    </h3>
                                    <p className="mt-2 text-sm uppercase tracking-[0.15em] text-neutral-700">
                                        {s.tagline}
                                    </p>
                                    <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-800">
                                        {s.body}
                                    </p>
                                </div>
                                <ul className="mt-10 space-y-2 border-t border-neutral-200 pt-6">
                                    {s.bullets.map((b) => (
                                        <li key={b} className="flex items-center gap-3 text-sm text-neutral-800">
                                            <span className="h-1 w-1 rounded-full bg-orange-500" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
