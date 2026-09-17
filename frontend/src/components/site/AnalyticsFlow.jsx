import React from "react";
import { motion } from "framer-motion";
import {
    FileCsv, Database, CloudArrowDown,
    Cylinder, ChartLine, Lightbulb, ShareNetwork, ChartBar,
} from "@phosphor-icons/react";

/*
 * Animated analytics flow for mid-page section.
 * Left: Data sources (CSV, SQL, Cloud)
 * Middle: Processing (Dataverse, Fabric, Semantic Model)
 * Right: Outputs (Power BI, AI Insights, Sharing)
 */

const sources = [
    { icon: FileCsv, label: "Flat Files", sub: "CSV · Excel · Parquet", tone: "#107C41" },
    { icon: Database, label: "Databases", sub: "SQL · Oracle · PostgreSQL", tone: "#0072C6" },
    { icon: CloudArrowDown, label: "Cloud Apps", sub: "Salesforce · SAP · Dynamics", tone: "#036C70" },
];

const processing = [
    { icon: Cylinder, label: "OneLake", sub: "Unified storage", tone: "#F2C811" },
    { icon: Database, label: "Fabric", sub: "Data engineering", tone: "#4B53BC" },
    { icon: ChartLine, label: "Semantic Model", sub: "DAX · Measures · RLS", tone: "#48A14D" },
];

const outputs = [
    { icon: Lightbulb, label: "AI Insights", sub: "Copilot · Key influencers", tone: "#8B5CF6" },
    { icon: ChartBar, label: "Power BI", sub: "Dashboards · Paginated", tone: "#F2C811" },
    { icon: ShareNetwork, label: "Distribution", sub: "Email · Teams · Embed", tone: "#06B6D4" },
];

function Node({ icon: Icon, label, sub, tone, testid, delay = 0, size = "sm" }) {
    const sizes = {
        sm: { wrapper: "p-2.5", iconBox: "h-9 w-9", iconSize: 18, labelSize: "text-[11px]", subSize: "text-[10px]" },
        md: { wrapper: "p-3", iconBox: "h-11 w-11", iconSize: 22, labelSize: "text-[11px]", subSize: "text-[10px]" },
    };
    const s = sizes[size];

    return (
        <motion.div
            initial={{ opacity: 0, x: size === "sm" ? -8 : 0, y: size === "md" ? 8 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay }}
            data-testid={testid}
            className={`flex items-center gap-2.5 border border-neutral-200 bg-white ${s.wrapper} shadow-md`}
        >
            <div
                className={`grid flex-none place-items-center text-white ${s.iconBox}`}
                style={{ backgroundColor: tone }}
            >
                <Icon size={s.iconSize} weight="duotone" />
            </div>
            <div className="min-w-0">
                <div className={`truncate font-bold uppercase tracking-widest text-neutral-900 ${s.labelSize}`}>
                    {label}
                </div>
                <div className={`truncate text-neutral-700 ${s.subSize}`}>{sub}</div>
            </div>
        </motion.div>
    );
}

function Hub({ icon: Icon, label, sub, tone, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay }}
            className="relative"
        >
            <div className="relative border border-brand-light bg-white p-3 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className={`grid h-11 w-11 place-items-center text-white`} style={{ backgroundColor: tone }}>
                        <Icon size={22} weight="duotone" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">{label}</div>
                        <div className="text-[10px] text-neutral-700">{sub}</div>
                    </div>
                </div>
                <motion.span
                    className="pointer-events-none absolute inset-0 border-2"
                    style={{ borderColor: tone }}
                    animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.12, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    );
}

export default function AnalyticsFlow() {
    const leftPaths = [
        "M 90 60  C 170 60, 180 170, 240 170",
        "M 90 170 C 160 170, 190 170, 240 170",
        "M 90 280 C 170 280, 180 170, 240 170",
    ];
    const midPaths = [
        "M 260 100 C 310 100, 320 170, 370 170",
        "M 260 170 C 330 170, 340 170, 370 170",
        "M 260 240 C 310 240, 320 170, 370 170",
    ];
    const rightPaths = [
        "M 390 170 C 450 170, 460 60, 530 60",
        "M 390 170 C 470 170, 480 170, 530 170",
        "M 390 170 C 450 170, 460 280, 530 280",
    ];

    return (
        <div
            data-testid="analytics-flow"
            className="relative w-full max-w-[640px] mx-auto"
        >
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3 flex items-center justify-between border border-neutral-200 bg-white px-3 py-2 shadow-md"
            >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                    </span>
                    Live data → insights flow
                </div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-700">
                    HARVESTIQ LLP / analytics pipeline
                </div>
            </motion.div>

            <div className="relative border border-neutral-200 bg-white p-5 shadow-2xl">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Ingest</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Transform</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Deliver</span>
                </div>

                <div className="relative mt-4 h-[320px]">
                    <svg
                        viewBox="0 0 600 340"
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full"
                        aria-hidden
                    >
                        <defs>
                            <linearGradient id="analytics-in" x1="0" x2="1">
                                <stop offset="0%" stopColor="#D4D4D4" />
                                <stop offset="100%" stopColor="#48A14D" />
                            </linearGradient>
                            <linearGradient id="analytics-mid" x1="0" x2="1">
                                <stop offset="0%" stopColor="#48A14D" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                            <linearGradient id="analytics-out" x1="0" x2="1">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                        </defs>

                        {[...leftPaths, ...midPaths, ...rightPaths].map((d, i) => (
                            <path
                                key={`bg-${i}`}
                                d={d}
                                fill="none"
                                stroke="#EDEDED"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />
                        ))}

                        {leftPaths.map((d, i) => (
                            <motion.path
                                key={`in-${i}`}
                                d={d}
                                fill="none"
                                stroke="url(#analytics-in)"
                                strokeWidth="1.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.4 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                            />
                        ))}
                        {midPaths.map((d, i) => (
                            <motion.path
                                key={`mid-${i}`}
                                d={d}
                                fill="none"
                                stroke="url(#analytics-mid)"
                                strokeWidth="1.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.0 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                            />
                        ))}
                        {rightPaths.map((d, i) => (
                            <motion.path
                                key={`out-${i}`}
                                d={d}
                                fill="none"
                                stroke="url(#analytics-out)"
                                strokeWidth="1.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.6 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                            />
                        ))}

                        {leftPaths.map((d, i) => (
                            <circle key={`p-in-${i}`} r="3.4" fill="#48A14D">
                                <animateMotion
                                    dur={`${2.4 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                    calcMode="linear"
                                    begin={`${1.8 + i * 0.5}s`}
                                    path={d}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    keyTimes="0;0.1;0.9;1"
                                    dur={`${2.4 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    begin={`${1.8 + i * 0.5}s`}
                                />
                            </circle>
                        ))}
                        {midPaths.map((d, i) => (
                            <circle key={`p-mid-${i}`} r="3" fill="#8B5CF6">
                                <animateMotion
                                    dur={`${2.0 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                    calcMode="linear"
                                    begin={`${2.5 + i * 0.5}s`}
                                    path={d}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    keyTimes="0;0.1;0.9;1"
                                    dur={`${2.0 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    begin={`${2.5 + i * 0.5}s`}
                                />
                            </circle>
                        ))}
                        {rightPaths.map((d, i) => (
                            <circle key={`p-out-${i}`} r="3.4" fill="#06B6D4">
                                <animateMotion
                                    dur={`${2.6 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                    calcMode="linear"
                                    begin={`${3.5 + i * 0.5}s`}
                                    path={d}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    keyTimes="0;0.1;0.9;1"
                                    dur={`${2.6 + i * 0.3}s`}
                                    repeatCount="indefinite"
                                    begin={`${3.5 + i * 0.5}s`}
                                />
                            </circle>
                        ))}
                    </svg>

                    <div className="relative grid h-full grid-cols-3 items-stretch gap-4">
                        <div className="flex flex-col justify-between">
                            {sources.map((s, i) => (
                                <Node
                                    key={s.label}
                                    icon={s.icon}
                                    label={s.label}
                                    sub={s.sub}
                                    tone={s.tone}
                                    testid={`analytics-source-${i}`}
                                    delay={i * 0.1}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col justify-center gap-3">
                            {processing.map((p, i) => (
                                <Hub
                                    key={p.label}
                                    icon={p.icon}
                                    label={p.label}
                                    sub={p.sub}
                                    tone={p.tone}
                                    delay={0.6 + i * 0.2}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col justify-between">
                            {outputs.map((o, i) => (
                                <Node
                                    key={o.label}
                                    icon={o.icon}
                                    label={o.label}
                                    sub={o.sub}
                                    tone={o.tone}
                                    testid={`analytics-output-${i}`}
                                    delay={1.4 + i * 0.1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-4">
                    {[
                        { k: "120M+", v: "rows processed daily" },
                        { k: "<2s", v: "query latency p95" },
                        { k: "99.9%", v: "data freshness SLA" },
                    ].map((m, i) => (
                        <motion.div
                            key={m.v}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.2 + i * 0.1, duration: 0.4 }}
                            className="text-center"
                        >
                            <div className="font-display text-lg font-extrabold text-neutral-900">{m.k}</div>
                            <div className="text-[9px] uppercase tracking-widest text-neutral-500">{m.v}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}