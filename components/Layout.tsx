// components/Layout.tsx
import type { ReactNode } from "react"
import { useTheme } from "./ThemeContext"

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    const { theme } = useTheme()
    const isNeon = theme === "neon"

    return (
        <div
            className={`relative w-full min-h-screen flex items-center justify-center px-4 py-10 sm:py-12 transition-colors duration-500 ${isNeon ? "bg-[#0a0118]" : "bg-gradient-to-br from-[#a8edea] via-[#fed6e3] to-[#fbc2eb]"
                }`}
        >
            {/* Background Sky mode */}
            {!isNeon && (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,237,234,0.4),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(254,214,227,0.35),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(251,194,235,0.3),transparent_50%)] opacity-80" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_60%)] mix-blend-overlay" />
                </>
            )}

            {/* Background Neon mode */}
            {isNeon && (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.4),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(236,72,153,0.35),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.4),transparent_50%)] opacity-90" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(217,70,239,0.3),transparent_60%)] mix-blend-screen opacity-70" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.25),transparent_60%)] mix-blend-color-dodge opacity-50" />
                </>
            )}

            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
