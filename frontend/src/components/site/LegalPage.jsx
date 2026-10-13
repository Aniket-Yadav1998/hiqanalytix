import React, { useEffect } from "react";
import Footer from "@/components/site/Footer";

const privacySections = [
    {
        title: "Information we collect",
        content: "We collect information you choose to provide when you contact us or request our services, such as your name, business email address, phone number, company, industry, and message. We may also collect limited technical information, including device, browser, and site-usage data, to keep our website reliable and secure.",
    },
    {
        title: "How we use your information",
        content: "We use your information only to respond to your enquiry, provide and improve our services, maintain the security and performance of our website, and meet our legal obligations. We collect only the information reasonably needed for these purposes.",
    },
    {
        title: "How we protect your information",
        content: "We use appropriate administrative, technical, and organisational safeguards designed to protect personal information against unauthorised access, loss, misuse, alteration, or disclosure. Access is limited to authorised personnel who need the information to perform their work.",
    },
    {
        title: "Sharing and disclosure",
        content: "We do not sell, rent, or trade your personal information, and we do not share it with third parties for their own marketing purposes. We disclose information only when necessary to provide our services through trusted providers acting on our instructions, when you ask us to do so, or where disclosure is required by applicable law.",
    },
    {
        title: "Data retention",
        content: "We retain personal information only for as long as needed to fulfil the purpose for which it was collected, comply with legal, accounting, or reporting requirements, and resolve disputes where necessary. We then securely delete or anonymise it.",
    },
    {
        title: "Your choices and rights",
        content: "You may ask us to access, correct, update, or delete personal information we hold about you, subject to applicable law. You may also opt out of non-essential communications at any time by contacting us.",
    },
    {
        title: "Changes to this notice",
        content: "We may update this Privacy Policy as our practices or legal obligations change. Any update will be posted on this page with a revised effective date.",
    },
];

const termsSections = [
    {
        title: "Acceptance of these terms",
        content: "By accessing or using this website, you agree to these Terms of Use. If you do not agree, please do not use the website.",
    },
    {
        title: "Website information",
        content: "The material on this website is provided for general information about HARVESTIQ LLP and our services. It is not professional, legal, financial, or technical advice, and should not be relied on as the sole basis for making a decision.",
    },
    {
        title: "Permitted use",
        content: "You may use this website for lawful, personal, and business-information purposes. You must not interfere with the website, attempt to gain unauthorised access to its systems, introduce malicious code, or use its content in a way that infringes the rights of HARVESTIQ LLP or others.",
    },
    {
        title: "Intellectual property",
        content: "Unless otherwise stated, the website’s content, design, branding, graphics, and materials are owned by or licensed to HARVESTIQ LLP. You may not reproduce, distribute, modify, or create derivative works from them without our prior written permission.",
    },
    {
        title: "Third-party links",
        content: "This website may link to third-party websites for convenience. HARVESTIQ LLP does not control those websites and is not responsible for their content, availability, or privacy practices.",
    },
    {
        title: "Disclaimer and liability",
        content: "We work to keep this website accurate, secure, and available, but do not guarantee that it will always be complete, error-free, or uninterrupted. To the extent permitted by law, HARVESTIQ LLP is not liable for loss or damage arising from use of, or inability to use, this website.",
    },
    {
        title: "Changes to these terms",
        content: "We may revise these Terms of Use from time to time. Continued use of the website after changes are published means you accept the revised terms.",
    },
];

const pageContent = {
    privacy: {
        title: "Privacy Policy",
        summary: "Your information is handled with care, used only for legitimate business purposes, and never sold or shared for third-party marketing.",
        sections: privacySections,
    },
    terms: {
        title: "Terms of Use",
        summary: "These terms explain how you may use our website and the standards that help keep it secure, accurate, and useful for everyone.",
        sections: termsSections,
    },
};

export default function LegalPage({ page }) {
    const content = pageContent[page];

    useEffect(() => {
        document.title = `${content.title} | HARVESTIQ LLP`;
    }, [content.title]);

    return (
        <div className="App" data-testid={`${page}-page`}>
            <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
                    <a href="/" className="flex items-center gap-2.5" aria-label="Go to HARVESTIQ LLP home page">
                        <img src="/logo-transparent.png" alt="HARVESTIQ LLP" className="h-9 w-auto" />
                        <div className="flex flex-col leading-none">
                            <span className="font-display text-lg font-semibold tracking-tight text-neutral-900">
                                HARVESTIQ LLP
                            </span>
                            <span className="mt-0.5 text-xs tracking-[0.1em] text-neutral-700">
                                Analytics solutions
                            </span>
                        </div>
                    </a>
                    <a
                        href="/#contact"
                        className="text-sm font-medium text-neutral-700 transition-colors hover:text-brand-dark"
                    >
                        Contact us
                    </a>
                </div>
            </header>

            <main>
                <section className="border-b border-neutral-200 py-16 sm:py-24">
                    <div className="mx-auto max-w-4xl px-6 lg:px-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">
                            HARVESTIQ LLP
                        </p>
                        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                            {content.title}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600">
                            {content.summary}
                        </p>
                        <p className="mt-6 text-sm text-neutral-500">Last updated: October 9, 2026</p>
                    </div>
                </section>

                <section className="py-12 sm:py-16">
                    <div className="mx-auto max-w-4xl px-6 lg:px-10">
                        <div className="space-y-10">
                            {content.sections.map((section, index) => (
                                <section key={section.title} className="border-l-2 border-brand pl-5">
                                    <h2 className="font-display text-xl font-semibold text-neutral-900">
                                        {index + 1}. {section.title}
                                    </h2>
                                    <p className="mt-3 text-base leading-relaxed text-neutral-700">{section.content}</p>
                                </section>
                            ))}
                            <section className="border-l-2 border-brand pl-5">
                                <h2 className="font-display text-xl font-semibold text-neutral-900">
                                    Contact us
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-neutral-700">
                                    For questions about {content.title.toLowerCase()} or how we handle your information,
                                    email{" "}
                                    <a
                                        href="mailto:connect@hiqanalytix.com"
                                        className="font-medium text-brand-dark underline decoration-brand/50 underline-offset-4 hover:text-brand"
                                    >
                                        connect@hiqanalytix.com
                                    </a>.
                                </p>
                            </section>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
