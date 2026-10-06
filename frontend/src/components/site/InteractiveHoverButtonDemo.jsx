import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function InteractiveHoverButtonDemo() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 min-h-[200px] rounded-xl border border-slate-200">
      <h3 className="text-lg font-medium text-slate-800">
        HiQ Analytics Interactive CTA
      </h3>
      <InteractiveHoverButton
        text="Schedule Demo"
        onClick={() => alert("Redirecting to HiQ Analytics Contact Page...")}
      />
    </section>
  );
}

export default InteractiveHoverButtonDemo;