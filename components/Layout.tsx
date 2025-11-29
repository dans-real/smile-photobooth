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
            className={`relative w-full min-h-screen flex items-center justify-center px-4 py-10 sm:py-12 ${isNeon ? "bg-slate-950" : ""
                }`}
        >
            {/* Background Sky mode */}
            {!isNeon && (
                <>
                    <div className="pointer-events-none absolute inset-x-0 bottom-[-200px] h-[260px] bg-[radial-gradient(circle_at_50%_-10%,white,transparent_60%)] opacity-80" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.45),transparent_60%),radial-gradient(circle_at_85%_5%,rgba(255,255,255,0.28),transparent_60%)] mix-blend-screen opacity-70" />
                </>
            )}

            {/* Background Neon mode */}
            {isNeon && (
                <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(244,63,94,0.28),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(45,212,191,0.35),transparent_55%)] opacity-90" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(129,140,248,0.35),transparent_60%)] mix-blend-screen opacity-80" />
                </>
            )}

            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
