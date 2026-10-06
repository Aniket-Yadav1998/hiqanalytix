import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "min-w-[100px] px-4 pr-10 pl-8 py-2 text-xs",
  default: "min-w-[120px] px-5 pr-12 pl-10 py-2.5 text-sm",
  lg: "min-w-[140px] px-6 pr-14 pl-12 py-3 text-base",
  xl: "min-w-[180px] px-8 pr-18 pl-16 py-4 text-base",
};

const variantStyles = {
  primary: "border border-brand-light bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-brand bg-white text-brand hover:bg-brand-light",
};

const InteractiveHoverButton = React.forwardRef(
  ({ 
    text = "Get Started", 
    className, 
    size = "default", 
    variant = "primary",
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-full shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 whitespace-nowrap list-none inline-flex items-center pl-4",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        style={{ listStyle: 'none !important', listStyleType: 'none !important', listStyleImage: 'none !important', listStylePosition: 'outside !important' }}
        {...props}
      >
        {/* Default Label - with left and right padding for arrow */}
        <span className="inline-block pl-4 pr-6 translate-x-1 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0 font-semibold">
          {text}
        </span>

        {/* Hover Reveal Content - text + arrow with proper gap */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 translate-x-full opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 px-4">
          <span className="font-semibold pl-4">{text}</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5] flex-shrink-0" />
        </div>

        {/* Hover Expand Background Bubble */}
        <div className="absolute left-[15%] top-[40%] h-2 w-2 scale-[1] rounded-full transition-all duration-500 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.8] bg-brand-dark" />
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };