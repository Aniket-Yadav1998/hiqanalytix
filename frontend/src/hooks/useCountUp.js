import { useEffect, useRef, useState } from "react";

/*
 * Animate a number from 0 (or a given start) to `target` when `active` becomes true.
 * Uses requestAnimationFrame with easeOutCubic. Returns the current animated value.
 */
export default function useCountUp(target, {
    duration = 1400,
    active = true,
    start = 0,
    decimals = 0,
} = {}) {
    const [value, setValue] = useState(start);
    const rafRef = useRef();

    useEffect(() => {
        if (!active) return;
        const from = start;
        const to = Number(target) || 0;
        const t0 = performance.now();

        const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            const v = from + (to - from) * eased;
            setValue(Number(v.toFixed(decimals)));
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, active, start, decimals]);

    return value;
}
