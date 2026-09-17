import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    CheckCircle,
    DownloadSimple,
    FilePdf,
    SealCheck,
    X,
} from "@phosphor-icons/react";

const certificateUrl = "/startup-india-certificate.pdf";

export default function Certification() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    return (
        <>
            <section
                id="credentials"
                data-testid="certification-section"
                className="relative overflow-hidden border-y border-neutral-800 bg-neutral-950 py-24 text-white md:py-32"
            >
                <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center lg:gap-20 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="lg:col-span-5"
                    >
                        <div className="mb-7 inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300">
                            <SealCheck size={16} weight="duotone" />
                            Verified credentials
                        </div>
                        <h2 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
                            Built with ambition. <span className="text-emerald-300">Recognised by design.</span>
                        </h2>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
                            HARVESTIQ LLP is officially recognised under the Startup India initiative.
                            View the certificate directly and get confidence in the team behind your
                            next data and automation transformation.
                        </p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {["Official Startup India recognition", "Easy to verify and share"].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                                    <CheckCircle size={18} weight="duotone" className="flex-none text-emerald-300" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative mx-auto max-w-2xl">
                            <div className="absolute -inset-3 border border-emerald-300/20" />
                            <div className="relative border border-white/15 bg-white/[0.07] p-3 shadow-2xl shadow-black/30 backdrop-blur">
                                <div className="relative aspect-[1.414/1] overflow-hidden bg-white">
                                    <iframe
                                        title="Startup India certificate preview"
                                        src={`${certificateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="h-full w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(true)}
                                        className="absolute inset-0 flex items-center justify-center bg-neutral-950/0 opacity-0 transition-all duration-300 hover:bg-neutral-950/45 hover:opacity-100 focus:bg-neutral-950/45 focus:opacity-100"
                                        aria-label="Open Startup India certificate"
                                    >
                                        <span className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 shadow-xl">
                                            View certificate <ArrowUpRight size={16} weight="bold" />
                                        </span>
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4 px-2 pb-1 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center bg-emerald-300/15 text-emerald-300">
                                            <FilePdf size={22} weight="duotone" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Startup India Certificate</p>
                                            <p className="mt-0.5 text-xs text-white/50">Official document · PDF</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(true)}
                                            data-testid="certificate-view-button"
                                            className="inline-flex items-center justify-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-emerald-300 hover:text-emerald-300"
                                        >
                                            View certificate
                                        </button>
                                        <a
                                            href={certificateUrl}
                                            download="startup-india-certificate.pdf"
                                            data-testid="certificate-download-link"
                                            className="inline-flex items-center justify-center gap-2 bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-white"
                                        >
                                            <DownloadSimple size={15} weight="bold" /> Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="certificate-dialog-title"
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm md:p-8"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsOpen(false);
                    }}
                >
                    <div className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col border border-white/15 bg-neutral-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
                            <div>
                                <p id="certificate-dialog-title" className="text-sm font-semibold text-white">
                                    Startup India Certificate
                                </p>
                                <p className="mt-0.5 text-xs text-white/45">HARVESTIQ LLP · Official document</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={certificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hidden items-center gap-2 border border-white/15 px-3 py-2 text-xs text-white/80 hover:border-emerald-300 hover:text-emerald-300 sm:inline-flex"
                                >
                                    Open in new tab <ArrowUpRight size={14} />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close certificate viewer"
                                    className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 hover:border-white hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <iframe
                            title="Startup India certificate"
                            src={certificateUrl}
                            className="min-h-0 flex-1 bg-white"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
