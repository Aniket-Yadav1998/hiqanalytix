/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Arial', 'Helvetica', 'sans-serif'],
                sans: ['Arial', 'Helvetica', 'sans-serif'],
            },
            screens: {
                'nav-collapse': '1100px',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
                orange: {
                    50: '#E8F5E9',
                    200: '#B7DDBA',
                    300: '#8BC58F',
                    400: '#68B06D',
                    500: '#48A14D',
                    600: '#1E5E29',
                    700: '#1E5E29',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                brand: {
                    DEFAULT: '#48A14D',   // Leaf Green (primary)
                    dark: '#1E5E29',      // Deep Forest Green (hover/active)
                    light: '#E8F5E9',     // Light Green Tint (backgrounds)
                    navy: '#1B263B',      // Dark Charcoal Navy (text)
                },
                // --- OLD BRAND CONFIG (for 1-step revert) ---
                // brand: {
                //     DEFAULT: '#0055FF',
                //     ink: '#0A0A0C',
                //     accent: '#10B981',
                // },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'marquee': {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'marquee': 'marquee 40s linear infinite',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};