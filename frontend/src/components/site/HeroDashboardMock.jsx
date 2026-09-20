import React from "react";
import { motion } from "framer-motion";

/*
 * Animated SVG dashboard mock for the hero.
 * All animation is CSS/framer — no external images, so it always renders.
 */
export default function HeroDashboardMock() {
    const bars = [42, 66, 58, 78, 92, 71, 84];
    const spark = "M0,60 L20,45 L40,52 L60,30 L80,38 L100,20 L120,26 L140,14 L160,22 L180,10 L200,18";

    return (
        <div
            data-testid="hero-dashboard-mock"
            className="relative w-full max-w-[560px]"
        >
            {/* Floating badges around the frame */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute -left-6 top-8 z-20 border border-neutral-200 bg-white px-3 py-2 shadow-lg"
            >
                <div className="text-xs uppercase tracking-widest text-neutral-500">Revenue</div>
                <div className="mt-0.5 font-display text-xl font-bold text-neutral-900">
                    € 12.4M
                </div>
                <div className="mt-0.5 text-xs text-brand-dark">▲ 18.2%</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="absolute -right-4 top-40 z-20 border border-brand-light bg-brand px-3 py-2 text-white shadow-xl"
            >
                <div className="text-xs uppercase tracking-widest opacity-80">Automations</div>
                <div className="mt-0.5 font-display text-xl font-bold">2,148 hrs</div>
                <div className="mt-0.5 text-xs opacity-90">reclaimed this Q</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute -bottom-4 -left-2 z-20 border border-neutral-200 bg-white px-3 py-2 shadow-lg"
            >
                <div className="text-xs uppercase tracking-widest text-neutral-500">Uptime</div>
                <div className="mt-0.5 font-display text-xl font-bold text-neutral-900">99.98%</div>
            </motion.div>

            {/* Dashboard frame */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden border border-neutral-200 bg-white shadow-2xl"
            >
                {/* Chrome bar */}
                <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <div className="ml-3 flex-1 truncate text-xs text-neutral-500">
                        HARVESTIQ LLP / dashboards / executive
                    </div>
                    <span className="border border-brand-light bg-brand-light px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-brand-dark">
                        Live
                    </span>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3 border-b border-neutral-200 p-4">
                    {["Revenue", "OEE", "Backlog"].map((k, i) => (
                        <motion.div
                            key={k}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            className="border border-neutral-100 bg-neutral-50 p-3"
                        >
                            <div className="text-xs uppercase tracking-widest text-neutral-500">
                                {k}
                            </div>
                            <div className="mt-1 font-display text-base font-bold text-neutral-900">
                                {["€ 3.4M", "78.4%", "412"][i]}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-brand-dark">
                                ▲ {[12.3, 8.4, 3.1][i]}%
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bars chart */}
                <div className="border-b border-neutral-200 p-5">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-widest text-neutral-500">
                                Q4 · monthly performance
                            </div>
                            <div className="mt-1 font-display text-sm font-bold text-neutral-900">
                                Automation impact
                            </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                            <span className="inline-flex items-center gap-1 text-neutral-700">
                                <span className="h-2 w-2 bg-neutral-300" /> Before
                            </span>
                            <span className="inline-flex items-center gap-1 text-neutral-700">
                                <span className="h-2 w-2 bg-brand" /> After
                            </span>
                        </div>
                    </div>
                    <div className="mt-5 flex h-24 items-end justify-between gap-2">
                        {bars.map((h, i) => (
                            <div key={i} className="flex flex-1 flex-col items-center gap-1">
                                <div className="flex h-full w-full items-end gap-0.5">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(20, h - 25)}%` }}
                                        transition={{ delay: 0.6 + i * 0.05, duration: 0.7, ease: "easeOut" }}
                                        className="w-1/2 bg-neutral-300"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.8 + i * 0.05, duration: 0.7, ease: "easeOut" }}
                                        className="w-1/2 bg-brand"
                                    />
                                </div>
                                <span className="text-xs uppercase tracking-widest text-neutral-500">
                                    {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sparkline */}
                <div className="flex items-center justify-between p-5">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-neutral-500">
                            Cost saved (rolling 12w)
                        </div>
                        <div className="mt-1 font-display text-lg font-bold text-neutral-900">
                            € 1.24M
                        </div>
                    </div>
                    <svg viewBox="0 0 200 70" className="h-12 w-40">
                        <defs>
                            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#48A14D" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#48A14D" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={spark + " L200,70 L0,70 Z"}
                            fill="url(#grad)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1, duration: 0.6 }}
                        />
                        <motion.path
                            d={spark}
                            fill="none"
                            stroke="#48A14D"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                        />
                        <motion.circle
                            cx="200" cy="18" r="4"
                            fill="#48A14D"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: [0, 1.4, 1] }}
                            transition={{ delay: 2.1, duration: 0.6 }}
                        />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
}
