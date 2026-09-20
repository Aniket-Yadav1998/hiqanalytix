import React from "react";

const tools = [
    { name: "Power BI", short: "BI", color: "#F2C811" },
    { name: "Power Apps", short: "PA", color: "#742774" },
    { name: "Power Automate", short: "Fl", color: "#0066FF" },
    { name: "Power Virtual Agents", short: "VA", color: "#00BCF2" },
    { name: "Copilot Studio", short: "Co", color: "#7B4DFF" },
    { name: "Dataverse", short: "Dv", color: "#008272" },
    { name: "SharePoint", short: "SP", color: "#036C70" },
    { name: "Microsoft Fabric", short: "Fa", color: "#118DFF" },
    { name: "Azure", short: "Az", color: "#0078D4" },
    { name: "Azure Data Factory", short: "DF", color: "#0072C6" },
    { name: "Azure Synapse", short: "Sy", color: "#3C3C99" },
    { name: "SQL Server", short: "SQL", color: "#CC2927" },
    { name: "Microsoft Teams", short: "Tm", color: "#4B53BC" },
    { name: "Excel", short: "Xl", color: "#107C41" },
    { name: "OneDrive", short: "OD", color: "#0364B8" },
    { name: "Outlook", short: "Ol", color: "#0072C6" },
];

const Track = ({ items, className }) => (
    <div
        className={`marquee-wrapper flex items-center overflow-hidden${className ? ` ${className}` : ""}`}
    >
        <div
            className="marquee-track items-center gap-2 whitespace-nowrap"
            style={{ animationDuration: "55s" }}
        >
            {items.map((t, i) => (
                <span
                    key={`marquee-${t.short}-${i}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700"
                >
                    <span
                        className="inline-block h-2 w-2"
                        style={{ backgroundColor: t.color }}
                        aria-hidden="true"
                    />
                    {t.name}
                </span>
            ))}
        </div>
    </div>
);

export default function TechStackMarquee() {
    const loop = [...tools, ...tools];

    return (
        <div
            id="stack"
            data-testid="tech-stack-marquee"
            className="border-t border-neutral-100 bg-neutral-50 py-4"
        >
            <Track items={loop} />
        </div>
    );
}