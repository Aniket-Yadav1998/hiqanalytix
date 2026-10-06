import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PaperPlaneTilt, EnvelopeSimple, MapPin, CaretDown, Check, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const countries = [
    { code: "IN", flag: "🇮🇳", name: "India", dial: "+91", digits: [10] },
    { code: "US", flag: "🇺🇸", name: "United States", dial: "+1", digits: [10] },
    { code: "CA", flag: "🇨🇦", name: "Canada", dial: "+1", digits: [10] },
    { code: "GB", flag: "🇬🇧", name: "United Kingdom", dial: "+44", digits: [10] },
    { code: "DE", flag: "🇩🇪", name: "Germany", dial: "+49", digits: [10, 11] },
    { code: "FR", flag: "🇫🇷", name: "France", dial: "+33", digits: [9] },
    { code: "IT", flag: "🇮🇹", name: "Italy", dial: "+39", digits: [9, 10] },
    { code: "ES", flag: "🇪🇸", name: "Spain", dial: "+34", digits: [9] },
    { code: "NL", flag: "🇳🇱", name: "Netherlands", dial: "+31", digits: [9] },
    { code: "BE", flag: "🇧🇪", name: "Belgium", dial: "+32", digits: [9] },
    { code: "CH", flag: "🇨🇭", name: "Switzerland", dial: "+41", digits: [9] },
    { code: "AT", flag: "🇦🇹", name: "Austria", dial: "+43", digits: [10, 11] },
    { code: "SE", flag: "🇸🇪", name: "Sweden", dial: "+46", digits: [9] },
    { code: "NO", flag: "🇳🇴", name: "Norway", dial: "+47", digits: [8] },
    { code: "DK", flag: "🇩🇰", name: "Denmark", dial: "+45", digits: [8] },
    { code: "FI", flag: "🇫🇮", name: "Finland", dial: "+358", digits: [9, 10] },
    { code: "IE", flag: "🇮🇪", name: "Ireland", dial: "+353", digits: [9] },
    { code: "PT", flag: "🇵🇹", name: "Portugal", dial: "+351", digits: [9] },
    { code: "PL", flag: "🇵🇱", name: "Poland", dial: "+48", digits: [9] },
    { code: "CZ", flag: "🇨🇿", name: "Czech Republic", dial: "+420", digits: [9] },
    { code: "AU", flag: "🇦🇺", name: "Australia", dial: "+61", digits: [9] },
    { code: "NZ", flag: "🇳🇿", name: "New Zealand", dial: "+64", digits: [8, 9] },
    { code: "JP", flag: "🇯🇵", name: "Japan", dial: "+81", digits: [9, 10] },
    { code: "SG", flag: "🇸🇬", name: "Singapore", dial: "+65", digits: [8] },
    { code: "AE", flag: "🇦🇪", name: "United Arab Emirates", dial: "+971", digits: [9] },
    { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", dial: "+966", digits: [9] },
    { code: "ZA", flag: "🇿🇦", name: "South Africa", dial: "+27", digits: [9] },
];

const industries = ["Financial", "Automotive", "Engineering", "Energy", "Health"];
const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const initial = {
    name: "",
    email: "",
    country: "IN",
    phone: "",
    telephone: "",
    industry: "",
    message: "",
    website: "",
    captcha_answer: "",
};

function randomCaptcha() {
    return { a: 1 + Math.floor(Math.random() * 9), b: 1 + Math.floor(Math.random() * 9) };
}

function validate(f, captchaObj) {
    const errors = {};
    const country = countries.find((item) => item.code === f.country);
    const mobileDigits = f.phone.replace(/\D/g, "");
    const captchaSum = captchaObj.a + captchaObj.b;
    
    // Name validation
    const name = f.name.trim();
    if (!name) {
        errors.name = "Full name is required";
    } else if (name.length < 2) {
        errors.name = "Name must be at least 2 characters";
    } else if (!/^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u.test(name)) {
        errors.name = "Name can only contain letters, spaces, apostrophes, and hyphens";
    }

    // Email validation
    const email = f.email.trim();
    const emailParts = email.split("@");
    const emailLocal = emailParts[0] || "";
    const emailDomain = emailParts[1] || "";
    if (!email) {
        errors.email = "Work email is required";
    } else if (!emailPattern.test(email)) {
        errors.email = "Enter a valid email format (e.g., jane@company.com)";
    } else if (email.length > 254) {
        errors.email = "Email is too long (max 254 characters)";
    } else if (email.includes("..")) {
        errors.email = "Email cannot contain consecutive dots";
    } else if (emailLocal.startsWith(".") || emailLocal.endsWith(".")) {
        errors.email = "Email local part cannot start or end with a dot";
    } else if (emailDomain.endsWith(".") || emailDomain.split(".").some((part) => part.length < 2)) {
        errors.email = "Email domain is invalid (each part must be at least 2 characters)";
    } else if (!emailDomain.includes(".")) {
        errors.email = "Email must include a domain (e.g., company.com)";
    }

    // Country validation
    if (!country) {
        errors.country = "Select your country";
    } else {
        const validLengths = country.digits;
        const minDigits = Math.min(...validLengths);
        const maxDigits = Math.max(...validLengths);
        const expected = validLengths.length === 1 ? `${validLengths[0]} digits` : `${minDigits}–${maxDigits} digits`;

        if (!f.phone.trim()) {
            errors.phone = `Mobile number is required for ${country.name}`;
        } else if (!/^[\d\s()-]+$/.test(f.phone.trim())) {
            errors.phone = `Enter a valid ${country.name} mobile number (${expected}) — digits, spaces, parentheses, or dashes only`;
        } else if (mobileDigits.length < minDigits) {
            errors.phone = `Mobile number too short — ${country.name} requires ${minDigits} digits (you entered ${mobileDigits.length})`;
        } else if (mobileDigits.length > maxDigits) {
            errors.phone = `Mobile number too long — ${country.name} allows max ${maxDigits} digits (you entered ${mobileDigits.length})`;
        } else if (!validLengths.includes(mobileDigits.length)) {
            errors.phone = `Enter a valid ${country.name} mobile number (${expected})`;
        }
    }

    // Telephone validation
    if (f.telephone && f.telephone.trim() && !/^[\d\s+()\-]{6,32}$/.test(f.telephone.trim())) {
        errors.telephone = "Enter a valid telephone number (6-32 characters, digits, spaces, +, -, parentheses only)";
    }

    // Industry validation
    if (!industries.includes(f.industry)) {
        errors.industry = `Please select your industry from: ${industries.join(", ")}`;
    }

    // Message validation
    const message = f.message.trim();
    if (!message) {
        errors.message = "Problem statement is required";
    } else if (message.length < 10) {
        errors.message = `Message too short — at least 10 characters (currently ${message.length})`;
    } else if (message.length > 500) {
        errors.message = `Message too long — max 500 characters (currently ${message.length})`;
    }

    // Honeypot
    if (f.website.trim()) {
        errors.website = "Unable to submit this form";
    }

    // Captcha validation
    if (!f.captcha_answer.trim()) {
        errors.captcha_answer = "Please answer the math question to verify you're human";
    } else if (Number(f.captcha_answer.trim()) !== captchaSum) {
        errors.captcha_answer = "Please enter a valid answer";
    }
    return errors;
}

export default function Contact() {
    const [form, setForm] = useState(initial);
    const [formStartedAt] = useState(() => Date.now());
    const [captcha, setCaptcha] = useState(randomCaptcha);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [countryOpen, setCountryOpen] = useState(false);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validateField = (name) => {
        const error = validate(form, captcha)[name];
        setErrors((current) => ({ ...current, [name]: error }));
    };

    const selectedCountry = countries.find((country) => country.code === form.country) || countries[0];

    const onSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form, captcha);
        if (Date.now() - formStartedAt < 2500) errs.form = "Please take a moment to review your details";
        if (Object.keys(errs).length) {
            setErrors(errs);
            setApiError(null);
            toast.error("Please fix the highlighted fields");
            return;
        }
        setApiError(null);
        try {
            setSubmitting(true);
            const country = countries.find((item) => item.code === form.country);
            await axios.post(`${API}/contact`, {
                name: form.name,
                email: form.email,
                country: form.country,
                phone: `${country.dial} ${form.phone}`,
                telephone: form.telephone,
                company: form.industry,
                message: form.message,
                website: form.website,
                form_started_at: formStartedAt,
                human_confirmed: true,
            });
            toast.success("Thanks — we'll be in touch within 1 business day.");
            setForm(initial);
            setCaptcha(randomCaptcha());
        } catch (err) {
            const detail = err?.response?.data?.detail;
            let msg = "Something went wrong. Please try again.";
            if (Array.isArray(detail)) {
                msg = detail.join(", ");
            } else if (typeof detail === "string") {
                msg = detail;
            }
            setApiError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const field = (label, name, type = "text", placeholder = "", extra = {}) => {
        const MAX_MESSAGE_LENGTH = 500;
        const currentLength = name === "message" ? (form[name]?.length || 0) : 0;
        const isMessage = name === "message";

        return (
            <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900">
                    {label}
                </span>
                {isMessage ? (
                    <>
                        <textarea
                            name={name}
                            rows={5}
                            value={form[name]}
                            onChange={onChange}
                            onBlur={() => validateField(name)}
                            placeholder={placeholder}
                            maxLength={MAX_MESSAGE_LENGTH}
                            data-testid={`contact-input-${name}`}
                            className={`w-full resize-none border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 ${
                                errors[name]
                                    ? "border-red-400 focus:ring-red-300"
                                    : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
                            }`}
                            {...extra}
                        />
                        <p className="mt-1 text-right text-xs text-neutral-500" data-testid="message-char-count">
                            {currentLength} / {MAX_MESSAGE_LENGTH}
                        </p>
                    </>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={form[name]}
                        onChange={onChange}
                        onBlur={() => validateField(name)}
                        placeholder={placeholder}
                        autoComplete="off"
                        data-testid={`contact-input-${name}`}
                        className={`w-full border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 ${
                            errors[name]
                                ? "border-red-400 focus:ring-red-300"
                                : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
                        }`}
                        {...extra}
                    />
                )}
                {errors[name] && (
                    <span data-testid={`contact-error-${name}`} className="mt-2 block text-xs text-red-500">
                        {errors[name]}
                    </span>
                )}
            </label>
        );
    };

    return (
        <section
            id="contact"
            data-testid="contact-section"
            className="relative border-t border-neutral-100 bg-white py-24 md:py-32"
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
                        <span className="text-xs uppercase tracking-[0.25em] text-orange-600">Contact Us</span>
                        <h2
                            data-testid="contact-heading"
                            className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl lg:text-6xl"
                        >
                            Tell us what
                            <br />
                            you want to solve.
                        </h2>
                        <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-800">
                            Share a concise overview of the business challenge you are
                            addressing. Our senior consultants will respond within one
                            business day with a focused next step.
                        </p>

                        <ul className="mt-10 space-y-5">
                            <li className="flex items-center gap-4 text-neutral-800">
                                <span className="flex-shrink-0 grid h-10 w-10 place-items-center">
                                    <EnvelopeSimple weight="duotone" size={22} className="text-brand" />
                                </span>
                                <a
                                    href="mailto:connect@hiqanalytix.com"
                                    className="text-sm underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand"
                                    aria-label="Email HARVESTIQ LLP at connect@hiqanalytix.com"
                                >
                                    connect@hiqanalytix.com
                                </a>
                            </li>
                            <li className="flex items-center gap-4 text-neutral-800">
                                <span className="flex-shrink-0 grid h-10 w-10 place-items-center">
                                    <MapPin weight="duotone" size={22} className="text-brand" />
                                </span>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=World+Trade+Center+Kharadi+Pune+Maharashtra+411014+India"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand"
                                    aria-label="Open HARVESTIQ LLP office address in Google Maps"
                                >
                                    8th Floor, WORLD TRADE CENTER, Dholepatil Farms Rd,
                                    EON Free Zone, Kharadi, Pune, Maharashtra 411014, India
                                </a>
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
                        className="border border-neutral-200 bg-neutral-50 p-8 md:p-10 lg:col-span-7"
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <input
                                type="text"
                                name="website"
                                value={form.website}
                                onChange={onChange}
                                onBlur={() => validateField("phone")}
                                tabIndex="-1"
                                autoComplete="off"
                                aria-hidden="true"
                                className="absolute left-[-9999px] h-px w-px opacity-0"
                            />
                            {field("Full name", "name", "text", "Jane Doe")}
                            {field("Work email", "email", "email", "jane@company.com")}
                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900">
                                    Mobile number
                                </span>
                                <div className="relative flex">
                                    <button
                                        type="button"
                                        aria-haspopup="listbox"
                                        aria-expanded={countryOpen}
                                        aria-label="Select country code"
                                        data-testid="contact-country-picker"
                                        onClick={() => setCountryOpen((open) => !open)}
                                        className="flex w-[42%] min-w-0 items-center gap-2 border border-r-0 border-neutral-300 bg-neutral-100 px-3 py-3 text-left text-sm text-neutral-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-300"
                                    >
                                        <span className="rounded-sm bg-white px-1 text-xl leading-none shadow-sm" aria-hidden="true">{selectedCountry.flag}</span>
                                        <span className="min-w-0 flex-1 truncate">{selectedCountry.dial}</span>
                                        <CaretDown size={14} weight="bold" className={`flex-none transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {countryOpen && (
                                        <div
                                            role="listbox"
                                            aria-label="Country codes"
                                            className="absolute left-0 top-full z-30 mt-1 max-h-64 w-[min(360px,calc(100vw-3rem))] overflow-y-auto border border-neutral-200 bg-white p-1 shadow-xl"
                                        >
                                            {countries.map((country) => (
                                                <button
                                                    type="button"
                                                    role="option"
                                                    aria-selected={country.code === form.country}
                                                    key={country.code}
                                                    onClick={() => {
                                                        setForm((current) => ({ ...current, country: country.code }));
                                                        setCountryOpen(false);
                                                        if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
                                                    }}
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-neutral-800 transition-colors hover:bg-brand-light hover:text-brand-dark"
                                                >
                                                    <span className="text-xl leading-none" aria-hidden="true">{country.flag}</span>
                                                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                                                    <span className="text-xs text-neutral-500">{country.dial}</span>
                                                    {country.code === form.country && <Check size={15} weight="bold" className="text-brand" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={onChange}
                                        onBlur={() => validateField("phone")}
                                        placeholder="Mobile number"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        data-testid="contact-input-phone"
                                        className={`min-w-0 flex-1 border bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 ${
                                            errors.phone ? "border-red-400 focus:ring-red-300" : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
                                        }`}
                                    />
                                </div>
                                {errors.form && <p className="mt-5 text-xs text-red-500">{errors.form}</p>}
                                {errors.phone && <span data-testid="contact-error-phone" className="mt-2 block text-xs text-red-500">{errors.phone}</span>}
                            </label>
                            {field("Telephone (optional)", "telephone", "tel", "Office or landline number")}
                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900">
                                    Industry
                                </span>
                                <select
                                    name="industry"
                                    value={form.industry}
                                    onChange={onChange}
                                    onBlur={() => validateField("industry")}
                                    data-testid="contact-input-industry"
                                    className={`w-full border bg-white px-4 py-3 text-neutral-900 focus:outline-none focus:ring-1 ${
                                        errors.industry ? "border-red-400 focus:ring-red-300" : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
                                    }`}
                                >
                                    <option value="">Select your industry</option>
                                    {industries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                                </select>
                                {errors.industry && <span data-testid="contact-error-industry" className="mt-2 block text-xs text-red-500">{errors.industry}</span>}
                            </label>
                        </div>
                        <div className="mt-6">
                            {field("Problem statement", "message", "text", "Briefly describe the business problem, desired outcome and relevant context…")}
                        </div>
                        <label className={`mt-6 flex items-start gap-3 border px-4 py-3 transition-colors ${
                            errors.captcha_answer ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"
                        }`}>
                            <ShieldCheck size={17} weight="duotone" className="mt-2.5 flex-none text-brand" />
                            <span className="flex flex-1 flex-wrap items-center gap-3 text-xs leading-relaxed text-neutral-700">
                                <span>
                                    <strong className="font-semibold text-neutral-900">Verify you&apos;re human</strong>
                                    <br />
                                    What is {captcha.a} + {captcha.b}?
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    name="captcha_answer"
                                    value={form.captcha_answer}
                                    onChange={onChange}
                                    placeholder="Answer"
                                    aria-label={`What is ${captcha.a} + ${captcha.b}?`}
                                    data-testid="contact-captcha-input"
                                    className={`w-24 border bg-white px-3 py-2 text-center text-neutral-900 focus:outline-none focus:ring-1 ${
                                        errors.captcha_answer
                                            ? "border-red-400 focus:ring-red-300"
                                            : "border-neutral-300 focus:border-orange-500 focus:ring-orange-300"
                                    }`}
                                />
                            </span>
                        </label>
                        {errors.captcha_answer && (
                            <p data-testid="contact-error-captcha" className="mt-2 text-xs text-red-500">
                                {errors.captcha_answer}
                            </p>
                        )}
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
                            {apiError && (
                                <div className="w-full md:w-auto flex-1">
                                    <p className="text-sm text-red-500 flex items-center gap-1.5" data-testid="contact-api-error">
                                        <WarningCircle size={14} weight="duotone" />
                                        {apiError}
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-neutral-700">
                                By submitting, you agree to be contacted about your enquiry.
                            </p>
                            <InteractiveHoverButton
                                type="submit"
                                text={submitting ? "Sending…" : "Send message"}
                                disabled={submitting}
                                data-testid="contact-submit-btn"
                                size="xl"
                                variant="primary"
                            />
                        </div>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
