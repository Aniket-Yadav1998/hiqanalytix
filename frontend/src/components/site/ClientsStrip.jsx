import React from "react";

/*
 * Client logos strip — "Trusted by" marquee under the hero.
 * Uses text-based logo tiles so it always renders (no hotlinking risk).
 * Style is deliberately monochrome / neutral so the eye reads it as a list of
 * clients, not decoration. Enterprise sites do this the same way.
 */

const clients = [
    { name: "Nordvale Bank", ticker: "NV", tone: "font-serif italic tracking-tight" },
    { name: "AutoMerid", ticker: "AM", tone: "font-display uppercase tracking-[0.35em]" },
    { name: "Kestrel Engineering", ticker: "KE", tone: "font-display font-black tracking-tighter" },
    { name: "Solarion", ticker: "SN", tone: "font-serif tracking-widest" },
    { name: "Meridien Health", ticker: "MH", tone: "font-display font-semibold" },
    { name: "Vertex EPC", ticker: "VX", tone: "font-mono tracking-tighter" },
    { name: "NorthGrid Utilities", ticker: "NG", tone: "font-display font-extrabold uppercase tracking-widest" },
    { name: "Altura Finance", ticker: "AF", tone: "font-serif italic" },
    { name: "Helio Automotive", ticker: "HA", tone: "font-display font-bold uppercase tracking-[0.25em]" },
    { name: "Basalt Renewables", ticker: "BR", tone: "font-mono uppercase tracking-widest" },
];

const Tile = ({ c }) => (
    <div
        data-testid={`client-logo-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className="mx-8 flex h-14 min-w-[220px] items-center gap-3 whitespace-nowrap text-neutral-500 transition-colors duration-300 hover:text-neutral-900"
    >
        <span className="grid h-9 w-9 flex-none place-items-center border border-neutral-300 text-xs font-bold text-neutral-500 group-hover:border-neutral-900 group-hover:text-neutral-900">
            {c.ticker}
        </span>
        <span className={`text-lg text-neutral-500 ${c.tone}`}>{c.name}</span>
    </div>
);

export default function ClientsStrip() {
    const loop = [...clients, ...clients];

    return (
        <section
            data-testid="clients-strip"
            className="relative border-y border-neutral-200 bg-white py-10"
        >
            <div className="mx-auto mb-6 max-w-7xl px-6 lg:px-10">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-neutral-700">
                    Trusted by operators across five industries
                </p>
            </div>

            <div className="marquee-wrapper relative select-none overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
                <div className="marquee-track" style={{ animationDuration: "50s" }}>
                    {loop.map((c, i) => (
                        <Tile key={`${c.name}-${i}`} c={c} />
                    ))}
                </div>
            </div>
        </section>
    );
}
