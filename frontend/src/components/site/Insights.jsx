import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Plus } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const INITIAL = 5;
const STEP = 3;

const FALLBACK = [
    {
        id: "f1",
        title: "Why every Power BI programme fails at year 2 — and how to prevent it",
        excerpt: "Governance debt, dataset sprawl and no adoption metrics. The three quiet killers of enterprise BI programmes and the levers that fix them.",
        category: "Power BI",
        read_minutes: 6,
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        published_at: "2026-01-05T00:00:00Z",
    },
    {
        id: "f2",
        title: "RPA vs Power Automate vs Copilot Studio — the 2026 decision tree",
        excerpt: "A pragmatic decision framework we use with clients to pick the right automation tool for each of the 40+ processes we typically inventory in week one.",
        category: "Automation",
        read_minutes: 8,
        image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        published_at: "2025-12-18T00:00:00Z",
    },
    {
        id: "f3",
        title: "OEE dashboards that plant managers actually use",
        excerpt: "Six design principles behind the automotive OEE dashboards we deploy — and the anti-patterns that quietly kill adoption on the shop floor.",
        category: "Automotive",
        read_minutes: 5,
        image_url: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80",
        published_at: "2025-11-30T00:00:00Z",
    },
    {
        id: "f4",
        title: "Closing the books in 2.5 days: a Power BI + Power Automate blueprint",
        excerpt: "How we compressed a mid-market bank's monthly close from 9 days to 2.5, moving 42 Excel workbooks into a single governed pipeline.",
        category: "Financial",
        read_minutes: 7,
        image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
        published_at: "2025-10-30T00:00:00Z",
    },
    {
        id: "f5",
        title: "Renewables asset performance: from post-mortem reports to live triage",
        excerpt: "The four telemetry patterns that let a European IPP replace weekly PDFs with a Fabric-backed live triage cockpit — and cut ticket handling by 55%.",
        category: "Energy",
        read_minutes: 6,
        image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
        published_at: "2025-09-30T00:00:00Z",
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

function InsightCard({ p, i }) {
    return (
        <motion.article
            data-testid={`insight-card-${p.id}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            className="group flex flex-col overflow-hidden border border-neutral-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl sm:flex-row"
        >
            <div className="relative aspect-[16/10] w-full flex-none overflow-hidden sm:aspect-auto sm:h-auto sm:w-56">
                {p.image_url ? (
                    <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.classList.add("bg-orange-50");
                        }}
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center bg-orange-50 text-orange-500">
                        <span className="font-display text-2xl font-bold">hq</span>
                    </div>
                )}
                <span className="absolute left-3 top-3 border border-orange-200 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700 backdrop-blur-sm">
                    {p.category}
                </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                <div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-700">
                        <span className="uppercase tracking-widest">{formatDate(p.published_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                        <span className="inline-flex items-center gap-1">
                            <Clock size={12} weight="duotone" /> {p.read_minutes} min
                        </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug text-neutral-900 md:text-xl">
                        {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                        {p.excerpt}
                    </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <span className="text-xs uppercase tracking-widest text-neutral-500">
                        hiqanalytix insights
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition-transform duration-200 group-hover:translate-x-0.5">
                        Read note
                        <ArrowUpRight size={16} weight="bold" />
                    </span>
                </div>
            </div>
        </motion.article>
    );
}

export default function Insights() {
    const [posts, setPosts] = useState([]);
    const [visible, setVisible] = useState(INITIAL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await axios.get(`${API}/insights`, { params: { limit: 50 } });
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

    const items = loading && posts.length === 0 ? FALLBACK : posts;
    const shown = items.slice(0, visible);
    const remaining = Math.max(0, items.length - visible);

    return (
        <section
            id="insights"
            data-testid="insights-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* LEFT — sticky editorial header */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="h-px w-10 bg-orange-500" />
                                <span
                                    data-testid="insights-eyebrow"
                                    className="text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-600"
                                >
                                    Insights · {items.length} notes
                                </span>
                            </div>
                            <h2
                                data-testid="insights-heading"
                                className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-neutral-900 md:text-5xl lg:text-6xl"
                            >
                                Field notes
                                <br />
                                from the
                                <br />
                                <span className="relative inline-block text-orange-500">
                                    trenches.
                                    <span className="absolute -bottom-1 left-0 h-1 w-full bg-orange-500/80" />
                                </span>
                            </h2>
                            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-800">
                                Short, opinionated reads on how we run Power BI programmes,
                                automations and analytics practices. Written by the senior
                                practitioners who deliver them — no marketing filler.
                            </p>

                            <div className="mt-8 border-l-2 border-orange-500 pl-4">
                                <p className="text-sm leading-relaxed text-neutral-800">
                                    <strong className="text-neutral-900">New notes drop every 4–6 weeks.</strong>
                                    <br />
                                    Subscribe below to get them straight to your inbox.
                                </p>
                                <a
                                    href="#contact"
                                    data-testid="insights-subscribe-cta"
                                    className="mt-5 inline-flex items-center gap-2 border border-neutral-900 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
                                >
                                    Subscribe via email
                                </a>
                            </div>

                            {/* Live pulse indicator */}
                            <div className="mt-8 hidden items-center gap-3 border border-neutral-200 bg-neutral-50 p-3 lg:flex">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate text-[10px] uppercase tracking-widest text-neutral-500">
                                        Just published
                                    </div>
                                    <div className="truncate text-xs font-semibold text-neutral-900">
                                        {items[0]?.title || "Field notes from the trenches."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT — vertical stack of insight cards */}
                    <div className="lg:col-span-8">
                        <div
                            data-testid="insights-list"
                            className="flex flex-col gap-5"
                        >
                            {shown.map((p, i) => (
                                <InsightCard key={p.id} p={p} i={i} />
                            ))}
                        </div>

                        {remaining > 0 && (
                            <div className="mt-10 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setVisible((v) => v + STEP)}
                                    data-testid="insights-load-more"
                                    className="group inline-flex items-center gap-2 border border-neutral-900 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
                                >
                                    <Plus size={16} weight="bold" className="transition-transform duration-200 group-hover:rotate-90" />
                                    Load {Math.min(STEP, remaining)} more {remaining === 1 ? "note" : "notes"}
                                    <span className="ml-1 text-xs opacity-70">
                                        {shown.length} / {items.length}
                                    </span>
                                </button>
                            </div>
                        )}
                        {items.length > 0 && remaining === 0 && (
                            <p className="mt-10 text-center text-xs uppercase tracking-widest text-neutral-500">
                                You&apos;re all caught up · {items.length} notes shown
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
