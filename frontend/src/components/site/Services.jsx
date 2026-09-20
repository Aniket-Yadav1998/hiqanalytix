import React from "react";
import { motion } from "framer-motion";
import { Stack, ChartBar, Robot, Brain } from "@phosphor-icons/react";

const serviceTiles = [
    {
        key: "power-platform",
        icon: Stack,
        title: "Power Platform",
        tagline: "Build custom low-code business apps",
        body: "Model-driven and canvas apps, Dataverse architecture, ALM pipelines and enterprise governance — engineered to scale beyond the departmental prototype.",
        bullets: ["Canvas & model-driven apps", "Dataverse & Copilot Studio", "ALM & solution governance"],
    },
    {
        key: "power-bi",
        icon: ChartBar,
        title: "Power BI Dashboards",
        tagline: "Decision-grade analytics, not decoration",
        body: "Semantic models, executive dashboards and paginated reports designed by data storytellers — with performance tuning that actually holds up in production.",
        bullets: ["Semantic modeling & DAX", "Executive & operational dashboards", "Row-level security & governance"],
    },
    {
        key: "rpa",
        icon: Robot,
        title: "RPA",
        tagline: "Reliable automation for critical operations",
        body: "Attended and unattended robotic process automation that improves execution quality, reduces manual effort and integrates with the systems your teams already use.",
        bullets: ["Attended and unattended automation", "Process discovery and optimisation", "Enterprise controls and monitoring"],
    },
    {
        key: "agentic-ai",
        icon: Brain,
        title: "Agentic AI",
        tagline: "Intelligent systems that act with purpose",
        body: "Practical AI agents designed to interpret information, make governed decisions and complete multi-step business workflows with appropriate human oversight.",
        bullets: ["AI agent strategy and design", "Knowledge and workflow orchestration", "Governance, evaluation and oversight"],
    },
];

const serviceFeatured = {
    key: "business-automation",
    icon: Robot,
    title: "Business Automation",
    tagline: "Workflow orchestration across the enterprise",
    body: "Power Automate, workflow orchestration and system integration that reduce repetitive work, improve process visibility and connect the tools your teams rely on.",
    bullets: ["Power Automate workflows", "System integration and APIs", "Process governance and monitoring"],
};

export default function Services() {
    return (
        <section
            id="services"
            data-testid="services-section"
            className="relative border-t border-neutral-100 bg-neutral-50 pb-16 pt-24 md:pb-20 md:pt-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 md:grid-cols-12 md:gap-16">
                    <div className="col-span-12 md:col-span-6">
                        <span data-testid="services-eyebrow" className="text-xs uppercase tracking-[0.25em] text-orange-600">
                            What we do
                        </span>
                        <h2 data-testid="services-heading" className="mt-4 text-left font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl">
                            Five practices.
                            <br />
                            One outcome.
                        </h2>
                    </div>
                </div>

                <div data-testid="services-grid" className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 gap-6">
                    {serviceTiles.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.article
                                key={s.key}
                                data-testid={`service-card-${s.key}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className={`group relative flex flex-col justify-between overflow-hidden border border-neutral-200 bg-white p-8 transition-colors duration-300 hover:border-orange-400`}
                            >
                                <div>
                                    <div>
                                        <div className="inline-flex h-12 w-12 items-center justify-center border border-orange-200 bg-orange-50">
                                            <Icon weight="duotone" size={26} className="text-orange-500" />
                                        </div>
                                    </div>
                                    <h3 className="mt-8 font-display text-2xl font-bold text-neutral-900">
                                        {s.title}
                                    </h3>
                                    <p className="mt-2 text-sm tracking-[0.05em] text-neutral-700">
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

                <div data-testid="service-featured" className="mt-6 max-w-full">
                    <motion.article
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.32 }}
                        className="group relative flex flex-col justify-between overflow-hidden border border-neutral-200 bg-white p-8 transition-colors duration-300 hover:border-orange-400"
                    >
                        <div className="text-center">
                            <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center border border-orange-200 bg-orange-50">
                                <Robot weight="duotone" size={26} className="text-orange-500" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-neutral-900">
                                {serviceFeatured.title}
                            </h3>
                            <p className="mt-2 text-sm tracking-[0.05em] text-neutral-700">
                                {serviceFeatured.tagline}
                            </p>
                            <p className="mt-6 text-base leading-relaxed text-neutral-800">
                                {serviceFeatured.body}
                            </p>
                        </div>
                        <ul className="mt-10 space-y-2 border-t border-neutral-200 pt-6">
                            {serviceFeatured.bullets.map((b) => (
                                <li key={b} className="flex items-center gap-3 text-sm text-neutral-800">
                                    <span className="h-1 w-1 rounded-full bg-orange-500" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </motion.article>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.42 }}
                        className="mx-auto mt-6 max-w-3xl px-4 py-4 text-center"
                    >
                        <h3 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">
                            Data &amp; Integration
                        </h3>
                        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
                            The connected data, systems and automation foundation that links
                            these capabilities together and turns them into one dependable
                            operating model.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}