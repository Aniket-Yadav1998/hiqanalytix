import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Calculator, TrendDown, UsersThree, Clock, ChartLineUp, Lightning } from "@phosphor-icons/react";
import useCountUp from "@/hooks/useCountUp";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const industries = ["Financial", "Automotive", "Engineering", "Energy", "Health"];
const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const initial = {
    name: "",
    email: "",
    company: "",
    industry: "Financial",
    current_manpower: "",
    current_hours_per_week: "",
    current_tools: "",
};

function validate(f) {
    const errors = {};
    if (!f.name.trim() || f.name.trim().length < 2) errors.name = "Please enter your name";
    const email = f.email.trim();
    const emailParts = email.split("@");
    const emailLocal = emailParts[0] || "";
    const emailDomain = emailParts[1] || "";
    if (
        !emailPattern.test(email) ||
        email.length > 254 ||
        email.includes("..") ||
        emailLocal.startsWith(".") ||
        emailLocal.endsWith(".") ||
        emailDomain.endsWith(".") ||
        emailDomain.split(".").some((part) => part.length < 2)
    ) {
        errors.email = "Enter a valid business email address";
    }
    if (!f.company.trim() || f.company.trim().length < 2) errors.company = "Company is required";
    if (!industries.includes(f.industry)) errors.industry = "Pick an industry";
    const mp = Number(f.current_manpower);
    if (!Number.isFinite(mp) || mp < 1) errors.current_manpower = "How many people today? (min 1)";
    const hr = Number(f.current_hours_per_week);
    if (!Number.isFinite(hr) || hr < 1) errors.current_hours_per_week = "Total team hours / week?";
    if (!f.current_tools.trim() || f.current_tools.trim().length < 2)
        errors.current_tools = "List the main tools you use today";
    return errors;
}

const ORANGE = "#48A14D";
const INK = "#0B0B0F";
const MUTED = "#E5E5E5";

export default function RoiCalculator() {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) {
            setErrors(errs);
            toast.error("Please fix the highlighted fields");
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                ...form,
                current_manpower: Number(form.current_manpower),
                current_hours_per_week: Number(form.current_hours_per_week),
            };
            const { data } = await axios.post(`${API}/roi-estimate`, payload);
            setResult(data);
            toast.success("Estimate ready — see your projected savings below.");
        } catch (err) {
            const detail = err?.response?.data?.detail;
            const msg = Array.isArray(detail)
                ? detail.map((d) => d.msg).join(", ")
                : typeof detail === "string"
                ? detail
                : "Something went wrong. Please try again.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (name) =>
        `w-full border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 ${
            errors[name]
                ? "border-red-400 focus:ring-red-300"
                : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
        }`;

    const labelCls = "mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900";

    return (
        <section
            id="roi"
            data-testid="roi-section"
            className="relative border-t border-neutral-100 bg-neutral-50 py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-6">
                        <span className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-orange-700">
                            <Calculator size={14} weight="duotone" /> ROI Calculator
                        </span>
                        <h2
                            data-testid="roi-heading"
                            className="mt-6 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl"
                        >
                            See what
                            <br />
                            you would save.
                        </h2>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-800">
                            Tell us how you run analytics &amp; operations today. In 5
                            seconds we&apos;ll show you a conservative estimate of the
                            time, headcount and cost you could reclaim with HARVESTIQ LLP.
                        </p>
                    </div>

                    <motion.form
                        onSubmit={onSubmit}
                        noValidate
                        data-testid="roi-form"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="border border-neutral-200 bg-white p-8 shadow-sm md:p-10 lg:col-span-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className={labelCls}>Full name</span>
                                <input name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" className={inputCls("name")} data-testid="roi-input-name" />
                                {errors.name && <span className="mt-2 block text-xs text-red-500">{errors.name}</span>}
                            </label>
                            <label className="block">
                                <span className={labelCls}>Work email</span>
                                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="jane@company.com" className={inputCls("email")} data-testid="roi-input-email" />
                                {errors.email && <span className="mt-2 block text-xs text-red-500">{errors.email}</span>}
                            </label>
                            <label className="block">
                                <span className={labelCls}>Company</span>
                                <input name="company" value={form.company} onChange={onChange} placeholder="Acme Corp" className={inputCls("company")} data-testid="roi-input-company" />
                                {errors.company && <span className="mt-2 block text-xs text-red-500">{errors.company}</span>}
                            </label>
                            <label className="block">
                                <span className={labelCls}>Industry</span>
                                <select name="industry" value={form.industry} onChange={onChange} className={inputCls("industry")} data-testid="roi-input-industry">
                                    {industries.map((i) => (<option key={i} value={i}>{i}</option>))}
                                </select>
                            </label>
                            <label className="block">
                                <span className={labelCls}>People on the task today</span>
                                <input type="number" min="1" name="current_manpower" value={form.current_manpower} onChange={onChange} placeholder="e.g. 6" className={inputCls("current_manpower")} data-testid="roi-input-manpower" />
                                {errors.current_manpower && <span className="mt-2 block text-xs text-red-500">{errors.current_manpower}</span>}
                            </label>
                            <label className="block">
                                <span className={labelCls}>Team hours / week</span>
                                <input type="number" min="1" name="current_hours_per_week" value={form.current_hours_per_week} onChange={onChange} placeholder="e.g. 220" className={inputCls("current_hours_per_week")} data-testid="roi-input-hours" />
                                {errors.current_hours_per_week && <span className="mt-2 block text-xs text-red-500">{errors.current_hours_per_week}</span>}
                            </label>
                        </div>
                        <label className="mt-5 block">
                            <span className={labelCls}>Technology you use today</span>
                            <input name="current_tools" value={form.current_tools} onChange={onChange} placeholder="e.g. Excel, SAP exports, Tableau, manual RPA scripts…" className={inputCls("current_tools")} data-testid="roi-input-tools" />
                            {errors.current_tools && <span className="mt-2 block text-xs text-red-500">{errors.current_tools}</span>}
                        </label>

                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
                            <p className="text-xs text-neutral-700">
                                We save every submission securely. You&apos;ll only be contacted about this enquiry.
                            </p>
                            <button
                                type="submit"
                                disabled={submitting}
                                data-testid="roi-submit-btn"
                                className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Calculating…" : "Show my savings"}
                                <Calculator size={18} weight="bold" />
                            </button>
                        </div>
                    </motion.form>
                </div>

                {result && <RoiResult r={result} />}
            </div>
        </section>
    );
}

function RoiResult({ r }) {
    // Count-up animated numbers
    const money = useCountUp(r.money_savings_pct, { duration: 1400 });
    const manpower = useCountUp(r.manpower_reduction_pct, { duration: 1600 });
    const time = useCountUp(r.time_reduction_pct, { duration: 1800 });
    const projPeople = useCountUp(r.projected_manpower, { duration: 1600, decimals: 2 });
    const projHours = useCountUp(r.projected_hours_per_week, { duration: 1800, decimals: 1 });

    const savingsData = [
        { name: "You reclaim", value: r.money_savings_pct, color: ORANGE },
        { name: "Remaining spend", value: 100 - r.money_savings_pct, color: MUTED },
    ];
    const manpowerData = [
        { name: "Reduction", value: r.manpower_reduction_pct, color: ORANGE },
        { name: "Retained", value: 100 - r.manpower_reduction_pct, color: MUTED },
    ];
    const timeData = [
        { name: "Reduction", value: r.time_reduction_pct, color: ORANGE },
        { name: "Remaining", value: 100 - r.time_reduction_pct, color: MUTED },
    ];

    // Faux 8-week growth curve — cumulative saving trending up
    const curve = Array.from({ length: 12 }, (_, i) => {
        const pct = 1 - Math.exp(-i / 3.2);
        return Math.round(pct * r.money_savings_pct);
    });
    const maxCurve = Math.max(...curve, 1);
    const points = curve
        .map((v, i) => `${(i / (curve.length - 1)) * 100},${100 - (v / maxCurve) * 100}`)
        .join(" ");

    return (
        <motion.div
            data-testid="roi-result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 border border-neutral-200 bg-white p-8 shadow-sm md:p-12"
        >
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-600">
                        <Lightning size={14} weight="fill" /> Your live estimate
                    </span>
                    <h3 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 md:text-4xl">
                        Projected impact for {r.company}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-800">
                        Industry: <span className="font-semibold text-neutral-900">{r.industry}</span>
                        &nbsp;·&nbsp; Baseline: {r.current_manpower} people ·{" "}
                        {r.current_hours_per_week} hrs / week ·{" "}
                        <span className="italic">{r.current_tools}</span>
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Saved · Sales notified
                </span>
            </div>

            {/* Animated dashboard mock header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-10 overflow-hidden border border-neutral-200 bg-neutral-50"
            >
                <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    <div className="ml-3 flex-1 truncate text-[11px] text-neutral-500">
                        HARVESTIQ LLP / ROI / {r.company.toLowerCase().replace(/\s+/g, "-")}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-700">
                        <ChartLineUp size={12} weight="bold" /> Live projection
                    </span>
                </div>

                {/* Big KPI counters */}
                <div className="grid grid-cols-1 gap-px bg-neutral-200 md:grid-cols-3">
                    <div className="bg-white p-6" data-testid="roi-kpi-money">
                        <div className="flex items-center gap-2 text-orange-500">
                            <TrendDown size={16} weight="duotone" />
                            <span className="text-[10px] uppercase tracking-widest text-neutral-700">
                                Annualised cost saved
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-display text-4xl font-extrabold text-neutral-900 md:text-5xl">
                                {money}%
                            </span>
                            <span className="text-xs text-neutral-700">of your run-rate</span>
                        </div>
                        <div className="mt-5 h-1.5 w-full overflow-hidden bg-neutral-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.money_savings_pct}%` }}
                                transition={{ duration: 1.4, ease: "easeOut" }}
                                className="h-full bg-orange-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6" data-testid="roi-kpi-manpower">
                        <div className="flex items-center gap-2 text-orange-500">
                            <UsersThree size={16} weight="duotone" />
                            <span className="text-[10px] uppercase tracking-widest text-neutral-700">
                                Manpower released
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-display text-4xl font-extrabold text-neutral-900 md:text-5xl">
                                {manpower}%
                            </span>
                            <span className="text-xs text-neutral-700">
                                ~ {projPeople} FTE to redeploy
                            </span>
                        </div>
                        <div className="mt-5 h-1.5 w-full overflow-hidden bg-neutral-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.manpower_reduction_pct}%` }}
                                transition={{ duration: 1.6, ease: "easeOut" }}
                                className="h-full bg-orange-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6" data-testid="roi-kpi-time">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Clock size={16} weight="duotone" />
                            <span className="text-[10px] uppercase tracking-widest text-neutral-700">
                                Execution time cut
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-display text-4xl font-extrabold text-neutral-900 md:text-5xl">
                                {time}%
                            </span>
                            <span className="text-xs text-neutral-700">
                                ~ {projHours} hrs/wk left
                            </span>
                        </div>
                        <div className="mt-5 h-1.5 w-full overflow-hidden bg-neutral-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.time_reduction_pct}%` }}
                                transition={{ duration: 1.8, ease: "easeOut" }}
                                className="h-full bg-orange-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Cumulative saving curve */}
                <div className="border-t border-neutral-200 bg-white p-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-neutral-700">
                                Cumulative saving · first 12 weeks
                            </div>
                            <div className="mt-1 font-display text-xl font-bold text-neutral-900">
                                Approaching {r.money_savings_pct}% run-rate
                            </div>
                        </div>
                        <span className="text-[11px] uppercase tracking-widest text-neutral-500">
                            week 1 → week 12
                        </span>
                    </div>

                    <div className="relative mt-4 h-40 w-full">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                            <defs>
                                <linearGradient id="roi-grad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#48A14D" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#48A14D" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* horizontal gridlines */}
                            {[0, 25, 50, 75, 100].map((y) => (
                                <line key={y} x1="0" y1={y} x2="100" y2={y}
                                      stroke="#E5E5E5" strokeWidth="0.2" strokeDasharray="1 1" />
                            ))}
                            <motion.polygon
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                points={`0,100 ${points} 100,100`}
                                fill="url(#roi-grad)"
                            />
                            <motion.polyline
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.3, duration: 1.6, ease: "easeOut" }}
                                points={points}
                                fill="none"
                                stroke="#48A14D"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* endpoint dot */}
                            <motion.circle
                                cx="100" cy={100 - (curve[curve.length - 1] / maxCurve) * 100} r="1.2"
                                fill="#48A14D"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 2.2, 1] }}
                                transition={{ delay: 1.9, duration: 0.6 }}
                            />
                        </svg>
                    </div>

                    {/* Weekly ticks */}
                    <div className="mt-2 flex justify-between text-[9px] uppercase tracking-widest text-neutral-500">
                        {["W1", "W3", "W5", "W7", "W9", "W12"].map((w) => (
                            <span key={w}>{w}</span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Original pie chart trio kept for depth */}
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard icon={TrendDown} title="Cost saving" value={`${r.money_savings_pct}%`}
                          subtitle="of what you spend today" data={savingsData} testid="roi-chart-cost" />
                <StatCard icon={UsersThree} title="Less manpower" value={`${r.manpower_reduction_pct}%`}
                          subtitle={`down to ~${r.projected_manpower} people`} data={manpowerData} testid="roi-chart-manpower" />
                <StatCard icon={Clock} title="Faster execution" value={`${r.time_reduction_pct}%`}
                          subtitle={`~${r.projected_hours_per_week} hrs / wk after`} data={timeData} testid="roi-chart-time" />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
                <p className="max-w-2xl text-sm text-neutral-800">
                    These are conservative mid-range estimates based on our delivery history.
                    Book a 20-minute discovery call and we&apos;ll refine them against your baseline.
                </p>
                <a
                    href="#contact"
                    data-testid="roi-cta-contact"
                    className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 font-medium text-white shadow-lg shadow-orange-500/20 transition-colors duration-200 hover:bg-orange-600"
                >
                    Book a discovery call
                </a>
            </div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, title, value, subtitle, data, testid }) {
    return (
        <div
            data-testid={testid}
            className="relative flex flex-col border border-neutral-200 bg-neutral-50 p-6"
        >
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center border border-orange-200 bg-orange-50">
                    <Icon size={20} weight="duotone" className="text-orange-500" />
                </span>
                <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-neutral-700">
                        {title}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center gap-6">
                <div className="relative h-32 w-32 flex-none">
                    <PieChart width={128} height={128}>
                        <Tooltip
                            contentStyle={{
                                background: "#fff",
                                border: "1px solid #E5E5E5",
                                color: INK,
                                fontSize: 12,
                                borderRadius: 0,
                            }}
                            formatter={(v, n) => [`${v}%`, n]}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            innerRadius={38}
                            outerRadius={56}
                            startAngle={90}
                            endAngle={-270}
                            stroke="#fff"
                            strokeWidth={2}
                            isAnimationActive
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="font-display text-2xl font-extrabold text-neutral-900">
                            {value}
                        </span>
                    </div>
                </div>
                <div>
                    <div className="font-display text-2xl font-bold text-neutral-900">{value}</div>
                    <div className="mt-1 text-xs leading-relaxed text-neutral-800">{subtitle}</div>
                </div>
            </div>
        </div>
    );
}
