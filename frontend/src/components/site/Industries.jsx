import React from "react";
import { motion } from "framer-motion";

const industries = [
    {
        key: "financial",
        title: "Financial",
        desc: "Regulatory reporting, close automation and real-time risk dashboards for banks, insurers and asset managers.",
        img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBhbmFseXRpY3MlMjBzdG9jayUyMG1hcmtldHxlbnwwfHx8fDE3ODY4MjA5OTd8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        key: "automotive",
        title: "Automotive",
        desc: "Plant OEE, supplier scorecards and after-sales analytics — from assembly line to dealer network.",
        img: "https://images.unsplash.com/photo-1581091212991-8891c7d4bd9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBjYXIlMjBhc3NlbWJseSUyMGxpbmV8ZW58MHx8fHwxNzg2ODIwOTk3fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        key: "engineering",
        title: "Engineering",
        desc: "Project controls, resource utilisation and design-to-delivery visibility for EPC and consulting firms.",
        img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    },
    {
        key: "energy",
        title: "Energy",
        desc: "Grid, generation and asset performance analytics for renewables, utilities and oil & gas operators.",
        img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHx3aW5kJTIwdHVyYmluZXMlMjBzdW5zZXR8ZW58MHx8fHwxNzg2ODIwOTk3fDA&ixlib=rb-4.1.0&q=85",
    },
    {
        key: "health",
        title: "Health",
        desc: "Patient flow, revenue cycle and clinical quality dashboards — HIPAA-aware and audit-ready.",
        img: "https://images.unsplash.com/photo-1758691461530-b215ed4ede6a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwzfHxkb2N0b3IlMjB0YWJsZXQlMjBob3NwaXRhbHxlbnwwfHx8fDE3ODY4MjA5OTd8MA&ixlib=rb-4.1.0&q=85",
    },
];

export default function Industries() {
    return (
        <section
            id="industries"
            data-testid="industries-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-6">
                        <span data-testid="industries-eyebrow" className="text-xs uppercase tracking-[0.25em] text-orange-600">
                            Industries served
                        </span>
                        <h2 data-testid="industries-heading" className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl">
                            Five industries.
                            <br />
                            One playbook.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-lg leading-relaxed text-neutral-800 lg:col-span-6 lg:pt-4">
                        Our reference architectures and delivery methodology are tuned to
                        the operating realities of each of these sectors — so you skip the
                        discovery tax.
                    </p>
                </div>

                <div data-testid="industries-grid" className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6">
                    {industries.map((ind, i) => (
                        <motion.a
                            key={ind.key}
                            href="#contact"
                            data-testid={`industry-card-${ind.key}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            className={`group relative block overflow-hidden border border-neutral-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl ${
                                i < 2 ? "md:col-span-3" : "md:col-span-2"
                            }`}
                        >
                            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                                <img
                                    src={ind.img}
                                    alt={`${ind.title} industry`}
                                    loading="lazy"
                                    className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-100"
                                />
                                {/* Bottom gradient only — image stays fully visible */}
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                                <span className="absolute right-4 top-4 border border-white/40 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur-sm">
                                    0{i + 1}
                                </span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                <h3 className="font-display text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
                                    {ind.title}
                                </h3>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/95 drop-shadow">
                                    {ind.desc}
                                </p>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
