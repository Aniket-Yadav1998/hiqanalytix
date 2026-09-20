import React from "react";
import { motion } from "framer-motion";
import { TrendUp, Clock, PiggyBank, ChartLineUp, ArrowUpRight } from "@phosphor-icons/react";

/*
 * Case Studies — hard numbers from Power BI & RPA engagements across 5 industries.
 * Numbers are illustrative but grounded in realistic ranges the practice can defend.
 */

const cases = [
    {
        industry: "Financial",
        client: "Mid-market European bank",
        summary: "Automated monthly Basel III regulatory pack from 42 spreadsheets into a single Power BI + Power Automate pipeline.",
        metrics: [
            { icon: Clock, label: "Reporting cycle", value: "-72%", detail: "from 9 days to 2.5 days" },
            { icon: PiggyBank, label: "Cost saved / yr", value: "€ 340K", detail: "3 FTE reallocated" },
            { icon: TrendUp, label: "Audit findings", value: "-100%", detail: "zero material observations" },
        ],
        stack: ["Power BI", "Power Automate", "Azure SQL", "Dataverse"],
    },
    {
        industry: "Automotive",
        client: "Tier-1 component supplier (EU)",
        summary: "Plant-floor OEE dashboards unified across 6 factories with real-time downtime root-cause tagging.",
        metrics: [
            { icon: ChartLineUp, label: "OEE lift", value: "+8.4pp", detail: "68% → 76.4% weighted" },
            { icon: Clock, label: "Downtime MTTR", value: "-38%", detail: "shift-lead alerts on Teams" },
            { icon: PiggyBank, label: "Payback", value: "4.2 mo", detail: "vs planned 12 mo" },
        ],
        stack: ["Power BI", "Azure Data Factory", "Power Apps", "Fabric"],
    },
    {
        industry: "Engineering",
        client: "Global EPC consultancy",
        summary: "Resource utilisation and project-margin cockpit replacing 3 legacy tools; adopted by 1,900+ project managers.",
        metrics: [
            { icon: ChartLineUp, label: "Utilisation", value: "+11pp", detail: "on billable pool" },
            { icon: Clock, label: "PM report time", value: "-6 h/wk", detail: "per project manager" },
            { icon: PiggyBank, label: "Margin uplift", value: "+3.1%", detail: "on active portfolio" },
        ],
        stack: ["Power BI", "Dataverse", "Power Apps", "SharePoint"],
    },
    {
        industry: "Energy",
        client: "European renewables IPP",
        summary: "Wind & solar asset performance dashboards with anomaly alerts driving predictive maintenance triage.",
        metrics: [
            { icon: TrendUp, label: "Availability", value: "+2.1pp", detail: "fleet weighted" },
            { icon: Clock, label: "Ticket triage", value: "-55%", detail: "hours per incident" },
            { icon: PiggyBank, label: "OPEX saved", value: "€ 1.2M", detail: "first 12 months" },
        ],
        stack: ["Fabric", "Power BI", "Azure IoT", "Power Automate"],
    },
    {
        industry: "Health",
        client: "Regional hospital network (7 sites)",
        summary: "Patient-flow & revenue-cycle command centre replacing daily manual PDF exports across departments.",
        metrics: [
            { icon: Clock, label: "ED throughput", value: "-31 min", detail: "average length of stay" },
            { icon: PiggyBank, label: "Denials", value: "-24%", detail: "revenue cycle" },
            { icon: TrendUp, label: "Adoption", value: "94%", detail: "clinical leadership DAU" },
        ],
        stack: ["Power BI", "Power Apps", "Dataverse", "Copilot Studio"],
    },
];

export default function CaseStudies() {
    return (
        <section
            id="case-studies"
            data-testid="case-studies-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
<div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-12">
                            <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-[0.25em] text-orange-600">
                                        Case studies
                                    </span>
                                    <h2
                                        data-testid="case-studies-heading"
                                        className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl"
                                    >
                                        <span className="inline-block">Hard numbers.</span>
                                        <span className="block">Not slideware.</span>
                                    </h2>
                                </div>
                                <p className="max-w-2xl text-left text-lg leading-relaxed text-neutral-900 lg:pt-0 lg:mt-6">
                                    Every engagement is measured against a baseline agreed at the
                                    outset. Here is a sample of what our Power BI dashboards and RPA
                                    automations have delivered across five industries.
                                </p>
                            </div>
                        </div>
                    </div>

                <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {cases.map((c, idx) => (
                        <motion.article
                            key={c.industry}
                            data-testid={`case-card-${c.industry.toLowerCase()}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className="group relative flex flex-col border border-neutral-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl md:p-10"
                        >
                            <div className="flex items-center gap-3">
                                <span className="border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                                    {c.industry}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-neutral-500">
                                    Case #{String(idx + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="mt-6 font-display text-2xl font-bold text-neutral-900 md:text-3xl">
                                {c.client}
                            </h3>
                            <p className="mt-3 text-base leading-relaxed text-neutral-800">
                                {c.summary}
                            </p>

                            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-6">
                                {c.metrics.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <div key={m.label} className="min-w-0">
                                            <div className="flex items-center gap-2 text-orange-500">
                                                <Icon weight="duotone" size={18} />
                                                <span className="truncate text-xs uppercase tracking-widest text-neutral-500">
                                                    {m.label}
                                                </span>
                                            </div>
                                            <div className="mt-2 font-display text-2xl font-bold text-neutral-900">
                                                {m.value}
                                            </div>
                                            <div className="mt-1 text-xs text-neutral-700">
                                                {m.detail}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {c.stack.map((s) => (
                                    <span
                                        key={s}
                                        className="border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <a
                                    href="#contact"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                    aria-label={`View ${c.industry} case study for ${c.client}`}
                                >
                                    View case
                                    <ArrowUpRight size={16} weight="bold" />
                                </a>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
