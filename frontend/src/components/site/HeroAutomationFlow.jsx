import React from "react";
import { motion } from "framer-motion";
import {
    FileXls, Database, Cloud,
    Robot, ChartBar, EnvelopeSimple, ChatCircleText,
} from "@phosphor-icons/react";

/*
 * Animated automation flow chart for the hero.
 * Left column: fragmented data sources (SAP, Excel, SharePoint).
 * Middle: Power Automate + Dataverse hub.
 * Right: Power BI dashboard, Teams alert, Executive email.
 * Orange "packets" travel along the connecting paths on a loop.
 */

const sources = [
    { icon: FileXls, label: "Excel / CSV", sub: "finance workbooks", tone: "#107C41" },
    { icon: Database, label: "SAP · Oracle", sub: "ERP extracts", tone: "#0072C6" },
    { icon: Cloud, label: "SharePoint", sub: "team libraries", tone: "#036C70" },
];

const outputs = [
    { icon: ChartBar, label: "Power BI", sub: "executive KPIs", tone: "#F2C811" },
    { icon: ChatCircleText, label: "Teams alert", sub: "shift leads", tone: "#4B53BC" },
    { icon: EnvelopeSimple, label: "Email digest", sub: "board pack", tone: "#F97316" },
];

// Node component
function Node({ icon: Icon, label, sub, tone, testid, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
            data-testid={testid}
            className="flex items-center gap-2.5 border border-neutral-200 bg-white p-2.5 shadow-md"
        >
            <div
                className="grid h-9 w-9 flex-none place-items-center text-white"
                style={{ backgroundColor: tone }}
            >
                <Icon size={18} weight="duotone" />
            </div>
            <div className="min-w-0">
                <div className="truncate text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                    {label}
                </div>
                <div className="truncate text-[10px] text-neutral-700">{sub}</div>
            </div>
        </motion.div>
    );
}

// Central hub node (bigger, orange)
function Hub({ icon: Icon, label, sub, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay }}
            className="relative"
        >
            <div className="relative border border-orange-200 bg-white p-3 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center bg-orange-500 text-white">
                        <Icon size={22} weight="duotone" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                            {label}
                        </div>
                        <div className="text-[10px] text-neutral-700">{sub}</div>
                    </div>
                </div>
                {/* pulsing halo */}
                <motion.span
                    className="pointer-events-none absolute inset-0 border-2 border-orange-400"
                    animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    );
}

export default function HeroAutomationFlow() {
    // The SVG connects nodes via cubic-Bezier paths.
    // Coordinates match the layout below (viewBox 500x340).
    // Left column x=90; Hub x=250; Right column x=410.
    const leftPaths = [
        "M 90 60  C 170 60, 180 170, 240 170",   // Excel → Hub
        "M 90 170 C 160 170, 190 170, 240 170",  // SAP   → Hub
        "M 90 280 C 170 280, 180 170, 240 170",  // SharePoint → Hub
    ];
    const rightPaths = [
        "M 260 170 C 320 170, 330 60, 410 60",   // Hub → Power BI
        "M 260 170 C 340 170, 360 170, 410 170", // Hub → Teams
        "M 260 170 C 320 170, 330 280, 410 280", // Hub → Email
    ];

    return (
        <div
            data-testid="hero-automation-flow"
            className="relative w-full max-w-[560px]"
        >
            {/* Header ribbon */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3 flex items-center justify-between border border-neutral-200 bg-white px-3 py-2 shadow-md"
            >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                    </span>
                    Live automation flow
                </div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">
                    hiqanalytix.com / orchestration
                </div>
            </motion.div>

            {/* Flow surface */}
            <div className="relative border border-neutral-200 bg-white p-5 shadow-2xl">
                {/* Column labels */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Sources
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-600">
                        Orchestration
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Outputs
                    </span>
                </div>

                {/* Grid layout with SVG connectors underneath */}
                <div className="relative mt-4 h-[320px]">
                    {/* SVG connectors */}
                    <svg
                        viewBox="0 0 500 340"
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full"
                        aria-hidden
                    >
                        <defs>
                            <linearGradient id="line-in" x1="0" x2="1">
                                <stop offset="0%" stopColor="#D4D4D4" />
                                <stop offset="100%" stopColor="#F97316" />
                            </linearGradient>
                            <linearGradient id="line-out" x1="0" x2="1">
                                <stop offset="0%" stopColor="#F97316" />
                                <stop offset="100%" stopColor="#D4D4D4" />
                            </linearGradient>
                        </defs>

                        {/* Static faint background paths */}
                        {[...leftPaths, ...rightPaths].map((d, i) => (
                            <path
                                key={`bg-${i}`}
                                d={d}
                                fill="none"
                                stroke="#EDEDED"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />
                        ))}

                        {/* Animated draw of the paths on mount */}
                        {leftPaths.map((d, i) => (
                            <motion.path
                                key={`in-${i}`}
                                d={d}
                                fill="none"
                                stroke="url(#line-in)"
                                strokeWidth="1.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.4 + i * 0.15, duration: 0.9, ease: "easeOut" }}
                            />
                        ))}
                        {rightPaths.map((d, i) => (
                            <motion.path
                                key={`out-${i}`}
                                d={d}
                                fill="none"
                                stroke="url(#line-out)"
                                strokeWidth="1.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.1 + i * 0.15, duration: 0.9, ease: "easeOut" }}
                            />
                        ))}

                        {/* Travelling packets — each is a circle following a <animateMotion> path */}
                        {leftPaths.map((d, i) => (
                            <circle key={`p-in-${i}`} r="3.4" fill="#F97316">
                                <animateMotion
                                    dur={`${2.4 + i * 0.4}s`}
                                    repeatCount="indefinite"
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                    calcMode="linear"
                                    begin={`${1.8 + i * 0.6}s`}
                                    path={d}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    keyTimes="0;0.1;0.9;1"
                                    dur={`${2.4 + i * 0.4}s`}
                                    repeatCount="indefinite"
                                    begin={`${1.8 + i * 0.6}s`}
                                />
                            </circle>
                        ))}
                        {rightPaths.map((d, i) => (
                            <circle key={`p-out-${i}`} r="3.4" fill="#F97316">
                                <animateMotion
                                    dur={`${2.6 + i * 0.4}s`}
                                    repeatCount="indefinite"
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                    calcMode="linear"
                                    begin={`${3.0 + i * 0.6}s`}
                                    path={d}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    keyTimes="0;0.1;0.9;1"
                                    dur={`${2.6 + i * 0.4}s`}
                                    repeatCount="indefinite"
                                    begin={`${3.0 + i * 0.6}s`}
                                />
                            </circle>
                        ))}
                    </svg>

                    {/* Nodes overlaid on the SVG */}
                    <div className="relative grid h-full grid-cols-3 items-stretch gap-4">
                        {/* Left column - sources */}
                        <div className="flex flex-col justify-between">
                            {sources.map((s, i) => (
                                <Node
                                    key={s.label}
                                    icon={s.icon}
                                    label={s.label}
                                    sub={s.sub}
                                    tone={s.tone}
                                    testid={`flow-source-${i}`}
                                    delay={i * 0.12}
                                />
                            ))}
                        </div>

                        {/* Center column - hub */}
                        <div className="flex flex-col justify-center gap-3">
                            <Hub icon={Robot} label="Power Automate" sub="cloud + desktop RPA" delay={0.5} />
                            <Hub icon={Database} label="Dataverse" sub="governed store" delay={0.8} />
                        </div>

                        {/* Right column - outputs */}
                        <div className="flex flex-col justify-between">
                            {outputs.map((o, i) => (
                                <Node
                                    key={o.label}
                                    icon={o.icon}
                                    label={o.label}
                                    sub={o.sub}
                                    tone={o.tone}
                                    testid={`flow-output-${i}`}
                                    delay={1.0 + i * 0.12}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-4">
                    {[
                        { k: "42", v: "steps automated" },
                        { k: "8.3s", v: "avg run time" },
                        { k: "0", v: "manual touches" },
                    ].map((m, i) => (
                        <motion.div
                            key={m.v}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 + i * 0.1, duration: 0.4 }}
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
