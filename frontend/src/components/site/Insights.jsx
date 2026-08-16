import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Fallback so the section always renders even before backend seed completes.
const FALLBACK = [
    {
        id: "f1",
        title: "Why every Power BI programme fails at year 2 — and how to prevent it",
        excerpt: "Governance debt, dataset sprawl and no adoption metrics. The three quiet killers of enterprise BI programmes and the levers that fix them.",
        category: "Power BI",
        read_minutes: 6,
        published_at: "2026-01-05T00:00:00Z",
    },
    {
        id: "f2",
        title: "RPA vs Power Automate vs Copilot Studio — the 2026 decision tree",
        excerpt: "A pragmatic decision framework we use with clients to pick the right automation tool for each of the 40+ processes we typically inventory in week one.",
        category: "Automation",
        read_minutes: 8,
        published_at: "2025-12-18T00:00:00Z",
    },
    {
        id: "f3",
        title: "OEE dashboards that plant managers actually use",
        excerpt: "Six design principles behind the automotive OEE dashboards we deploy — and the anti-patterns that quietly kill adoption.",
        category: "Automotive",
        read_minutes: 5,
        published_at: "2025-11-30T00:00:00Z",
    },
];

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch {
        return "";
    }
}

export default function Insights() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await axios.get(`${API}/insights`);
                if (mounted && Array.isArray(data) && data.length) setPosts(data);
                else if (mounted) setPosts(FALLBACK);
            } catch {
                if (mounted) setPosts(FALLBACK);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const items = loading ? FALLBACK : posts.slice(0, 6);

    return (
        <section
            id="insights"
            data-testid="insights-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-6">
                        <span className="text-xs uppercase tracking-[0.25em] text-orange-600">
                            Insights
                        </span>
                        <h2
                            data-testid="insights-heading"
                            className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl"
                        >
                            Field notes
                            <br />
                            from the trenches.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-lg leading-relaxed text-neutral-800 lg:col-span-6 lg:pt-4">
                        Short, opinionated reads on how we run Power BI programmes,
                        automations and analytics practices. Written by the senior
                        practitioners who deliver them — no marketing filler.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((p, i) => (
                        <motion.article
                            key={p.id}
                            data-testid={`insight-card-${p.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="group flex flex-col justify-between border border-neutral-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                                        {p.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700">
                                        <Clock size={12} weight="duotone" /> {p.read_minutes} min
                                    </span>
                                </div>
                                <h3 className="mt-6 font-display text-xl font-bold leading-snug text-neutral-900 md:text-2xl">
                                    {p.title}
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-neutral-800">
                                    {p.excerpt}
                                </p>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5">
                                <span className="text-xs uppercase tracking-widest text-neutral-700">
                                    {formatDate(p.published_at)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition-transform duration-200 group-hover:translate-x-0.5">
                                    Read note
                                    <ArrowUpRight size={16} weight="bold" />
                                </span>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-8">
                    <p className="text-sm text-neutral-800">
                        New notes drop every 4–6 weeks — one honest opinion at a time.
                    </p>
                    <a
                        href="#contact"
                        data-testid="insights-subscribe-cta"
                        className="inline-flex items-center gap-2 border border-neutral-900 px-5 py-3 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
                    >
                        Subscribe via email
                    </a>
                </div>
            </div>
        </section>
    );
}
