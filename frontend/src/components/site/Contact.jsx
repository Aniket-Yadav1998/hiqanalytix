import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PaperPlaneTilt, EnvelopeSimple, Phone as PhoneIcon, MapPin } from "@phosphor-icons/react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const initial = { name: "", email: "", phone: "", company: "", message: "" };

function validate(f) {
    const errors = {};
    if (!f.name.trim() || f.name.trim().length < 2) errors.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "Enter a valid email";
    if (!/^[\d\s+()\-]{6,32}$/.test(f.phone.trim())) errors.phone = "Enter a valid phone number";
    if (!f.company.trim() || f.company.trim().length < 2) errors.company = "Company is required";
    if (!f.message.trim() || f.message.trim().length < 10) errors.message = "Message must be at least 10 characters";
    return errors;
}

export default function Contact() {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

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
            await axios.post(`${API}/contact`, form);
            toast.success("Thanks — we'll be in touch within 1 business day.");
            setForm(initial);
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

    const field = (label, name, type = "text", placeholder = "", extra = {}) => (
        <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">
                {label}
            </span>
            {name === "message" ? (
                <textarea
                    name={name}
                    rows={5}
                    value={form[name]}
                    onChange={onChange}
                    placeholder={placeholder}
                    data-testid={`contact-input-${name}`}
                    className={`w-full resize-none border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 ${
                        errors[name]
                            ? "border-red-500/60 focus:ring-red-400"
                            : "border-white/10 focus:border-white/40 focus:ring-white/20"
                    }`}
                    {...extra}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    data-testid={`contact-input-${name}`}
                    className={`w-full border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 ${
                        errors[name]
                            ? "border-red-500/60 focus:ring-red-400"
                            : "border-white/10 focus:border-white/40 focus:ring-white/20"
                    }`}
                    {...extra}
                />
            )}
            {errors[name] && (
                <span
                    data-testid={`contact-error-${name}`}
                    className="mt-2 block text-xs text-red-400"
                >
                    {errors[name]}
                </span>
            )}
        </label>
    );

    return (
        <section
            id="contact"
            data-testid="contact-section"
            className="relative border-t border-white/5 bg-[#0A0A0C] py-24 md:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5"
                    >
                        <span className="text-xs uppercase tracking-[0.25em] text-[#0055FF]">
                            Contact
                        </span>
                        <h2
                            data-testid="contact-heading"
                            className="mt-4 font-display text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl"
                        >
                            Tell us
                            <br />
                            what you&apos;re building.
                        </h2>
                        <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
                            Send us a short brief and a senior consultant will get back to
                            you within one business day. No forms-for-forms-sake.
                        </p>

                        <ul className="mt-10 space-y-5">
                            <li className="flex items-center gap-4 text-white/80">
                                <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/5">
                                    <EnvelopeSimple weight="duotone" size={18} className="text-[#0055FF]" />
                                </span>
                                <a href="mailto:hello@hiqanalytix.com" className="text-sm hover:text-white">
                                    hello@hiqanalytix.com
                                </a>
                            </li>
                            <li className="flex items-center gap-4 text-white/80">
                                <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/5">
                                    <PhoneIcon weight="duotone" size={18} className="text-[#0055FF]" />
                                </span>
                                <span className="text-sm">+1 (555) 010-4477</span>
                            </li>
                            <li className="flex items-center gap-4 text-white/80">
                                <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/5">
                                    <MapPin weight="duotone" size={18} className="text-[#0055FF]" />
                                </span>
                                <span className="text-sm">Remote-first · Delivery centres globally</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.form
                        onSubmit={onSubmit}
                        noValidate
                        data-testid="contact-form"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="border border-white/10 bg-[#121215] p-8 md:p-10 lg:col-span-7"
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            {field("Full name", "name", "text", "Jane Doe")}
                            {field("Work email", "email", "email", "jane@company.com")}
                            {field("Phone", "phone", "tel", "+1 555 0100")}
                            {field("Company", "company", "text", "Acme Corp")}
                        </div>
                        <div className="mt-6">
                            {field("Message", "message", "text", "Briefly describe your project, timeline and goals…")}
                        </div>
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                            <p className="text-xs text-white/50">
                                By submitting, you agree to be contacted about your enquiry.
                            </p>
                            <button
                                type="submit"
                                disabled={submitting}
                                data-testid="contact-submit-btn"
                                className="group inline-flex items-center gap-2 bg-[#0055FF] px-6 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-[#0044cc] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "Sending…" : "Send message"}
                                <PaperPlaneTilt
                                    size={18}
                                    weight="bold"
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
