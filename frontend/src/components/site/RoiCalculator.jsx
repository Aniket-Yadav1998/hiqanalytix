import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Calculator, TrendDown, UsersThree, Clock } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const industries = ["Financial", "Automotive", "Engineering", "Energy", "Health"];

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "Enter a valid email";
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

const ORANGE = "#F97316";
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
                            time, headcount and cost you could reclaim with hiqanalytix.
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
                    <span className="text-xs uppercase tracking-[0.25em] text-orange-600">
                        Your estimate
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
                <span className="border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    Saved to your consultant
                </span>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                    icon={PiggyBankPlaceholder}
                    title="Cost saving"
                    value={`${r.money_savings_pct}%`}
                    subtitle="of what you spend today"
                    data={savingsData}
                    testid="roi-chart-cost"
                />
                <StatCard
                    icon={UsersThree}
                    title="Less manpower"
                    value={`${r.manpower_reduction_pct}%`}
                    subtitle={`down to ~${r.projected_manpower} people`}
                    data={manpowerData}
                    testid="roi-chart-manpower"
                />
                <StatCard
                    icon={Clock}
                    title="Faster execution"
                    value={`${r.time_reduction_pct}%`}
                    subtitle={`~${r.projected_hours_per_week} hrs / wk after`}
                    data={timeData}
                    testid="roi-chart-time"
                />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
                <p className="max-w-2xl text-sm text-neutral-800">
                    These are conservative mid-range estimates based on our delivery history.
                    Book a 20-minute discovery call and we&apos;ll refine them against your baseline.
                </p>
                <a
                    href="#contact"
                    data-testid="roi-cta-contact"
                    className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-orange-600"
                >
                    Book a discovery call
                </a>
            </div>
        </motion.div>
    );
}

function PiggyBankPlaceholder(props) {
    // Local wrapper so we can pass the Phosphor icon without importing here again.
    // Using TrendDown as a proxy for "cost coming down".
    return <TrendDown {...props} />;
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
