import React from "react";
import { motion } from "framer-motion";

/*
 * Horizontal marquee showcasing the Microsoft / data toolset.
 * Uses colored letter-mark tiles for maximum reliability across networks.
 */

const tools = [
    { name: "Power BI", short: "BI", color: "#F2C811", ink: "#1F1F1F" },
    { name: "Power Apps", short: "PA", color: "#742774", ink: "#FFFFFF" },
    { name: "Power Automate", short: "Fl", color: "#0066FF", ink: "#FFFFFF" },
    { name: "Power Virtual Agents", short: "VA", color: "#00BCF2", ink: "#FFFFFF" },
    { name: "Copilot Studio", short: "Co", color: "#7B4DFF", ink: "#FFFFFF" },
    { name: "Dataverse", short: "Dv", color: "#008272", ink: "#FFFFFF" },
    { name: "SharePoint", short: "SP", color: "#036C70", ink: "#FFFFFF" },
    { name: "Microsoft Fabric", short: "Fa", color: "#118DFF", ink: "#FFFFFF" },
    { name: "Azure", short: "Az", color: "#0078D4", ink: "#FFFFFF" },
    { name: "Azure Data Factory", short: "DF", color: "#0072C6", ink: "#FFFFFF" },
    { name: "Azure Synapse", short: "Sy", color: "#3C3C99", ink: "#FFFFFF" },
    { name: "SQL Server", short: "SQL", color: "#CC2927", ink: "#FFFFFF" },
    { name: "Microsoft Teams", short: "Tm", color: "#4B53BC", ink: "#FFFFFF" },
    { name: "Excel", short: "Xl", color: "#107C41", ink: "#FFFFFF" },
    { name: "OneDrive", short: "OD", color: "#0364B8", ink: "#FFFFFF" },
    { name: "Outlook", short: "Ol", color: "#0072C6", ink: "#FFFFFF" },
];

const Card = ({ t }) => (
    <div
        data-testid={`stack-card-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className="mx-3 flex h-24 min-w-[260px] items-center gap-4 border border-neutral-200 bg-white px-6 py-4 transition-colors duration-200 hover:border-orange-400"
    >
        <div
            className="grid h-12 w-12 flex-none place-items-center font-display text-sm font-bold"
            style={{ backgroundColor: t.color, color: t.ink }}
            aria-hidden="true"
        >
            {t.short}
        </div>
        <div className="min-w-0">
            <div className="truncate font-display text-base font-semibold text-neutral-900">
                {t.name}
            </div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">
                Microsoft stack
            </div>
        </div>
    </div>
);

export default function TechStack() {
    const loop = [...tools, ...tools];

    return (
        <section
            id="stack"
            data-testid="stack-section"
            className="relative overflow-hidden border-t border-neutral-100 bg-neutral-50 py-24 md:py-28"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-6">
                        <span className="text-xs uppercase tracking-[0.25em] text-orange-600">
                            Our toolset
                        </span>
                        <h2
                            data-testid="stack-heading"
                            className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl"
                        >
                            Platforms we build with.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-lg leading-relaxed text-neutral-600 lg:col-span-6 lg:pt-4">
                        Every project is delivered on a curated stack of Microsoft Power
                        Platform, Azure data services and modern automation tools —
                        chosen for governance, scale and total cost of ownership.
                    </p>
                </div>
            </div>

            {/* Auto-scrolling marquee (pauses on hover) */}
            <div
                data-testid="stack-marquee"
                className="marquee-wrapper relative mt-14 select-none"
            >
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-neutral-50 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-neutral-50 to-transparent" />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="marquee-track"
                >
                    {loop.map((t, i) => (
                        <Card key={`${t.name}-${i}`} t={t} />
                    ))}
                </motion.div>
            </div>

            {/* Manual horizontal scroll list */}
            <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
                <div
                    data-testid="stack-scrollable"
                    className="overflow-x-auto pb-3"
                    style={{ scrollbarColor: "#48A14D #F3F3F3" }}
                >
                    <div className="flex min-w-max gap-3">
                        {tools.map((t) => (
                            <span
                                key={`chip-${t.name}`}
                                className="inline-flex items-center gap-2 whitespace-nowrap border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700"
                            >
                                <span
                                    className="inline-block h-2 w-2"
                                    style={{ backgroundColor: t.color }}
                                    aria-hidden="true"
                                />
                                {t.name}
                            </span>
                        ))}
                    </div>
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                    ← Scroll horizontally to explore the full stack. Hover the marquee to pause it.
                </p>
            </div>
        </section>
    );
}
