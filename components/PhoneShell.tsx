// components/PhoneShell.tsx
import type { ReactNode } from "react"
import { useTheme } from "./ThemeContext"

type Props = {
    children: ReactNode
}

export default function PhoneShell({ children }: Props) {
    const { theme } = useTheme()
    const isNeon = theme === "neon"

    return (
        <div className="relative w-[320px] sm:w-[360px] float-card">
            {/* Bayangan bawah */}
            <div
                className={`absolute inset-x-6 -bottom-7 h-9 rounded-full blur-2xl transition-colors duration-500 ${isNeon ? "bg-fuchsia-500/70 opacity-90" : "bg-purple-400/50 opacity-70"
                    }`}
            />

            <div
                className={`relative rounded-[34px] overflow-hidden backdrop-blur border shadow-[0_22px_60px_rgba(15,23,42,0.65)] transition-all duration-500 ease-out hover:-translate-y-1 ${isNeon
                        ? "bg-gradient-to-br from-purple-950/90 to-fuchsia-950/80 border-fuchsia-500/70 shadow-[0_0_40px_rgba(236,72,153,0.4)]"
                        : "bg-white/95 border-purple-200/60 shadow-[0_22px_60px_rgba(168,85,247,0.25)]"
                    }`}
            >
                {/* Notch atas */}
                <div
                    className={`absolute top-3 left-1/2 -translate-x-1/2 h-7 w-32 rounded-full shadow-inner border transition-colors duration-500 ${isNeon
                            ? "bg-slate-900/95 border-purple-700/80"
                            : "bg-purple-100/90 border-purple-200/70"
                        }`}
                />

                {/* Tombol samping */}
                <div
                    className={`absolute left-[-3px] top-24 h-12 w-1.5 rounded-r-full transition-colors duration-500 ${isNeon ? "bg-purple-800/90" : "bg-purple-300/85"
                        }`}
                />
                <div
                    className={`absolute left-[-3px] top-40 h-7 w-1.5 rounded-r-full transition-colors duration-500 ${isNeon ? "bg-purple-800/80" : "bg-purple-300/75"
                        }`}
                />
                <div
                    className={`absolute right-[-3px] top-32 h-16 w-1.5 rounded-l-full transition-colors duration-500 ${isNeon ? "bg-purple-800/90" : "bg-purple-300/85"
                        }`}
                />

                {/* Sticker emoji ala scrapbook */}
                <span className="pointer-events-none absolute -left-2 top-9 text-2xl rotate-[-18deg]">
                    📸
                </span>
                <span className="pointer-events-none absolute -right-3 top-8 text-2xl rotate-[14deg]">
                    ☁️
                </span>
                <span className="pointer-events-none absolute -left-1 bottom-7 text-2xl rotate-[10deg]">
                    📱
                </span>
                <span className="pointer-events-none absolute -right-2 bottom-8 text-2xl rotate-[-12deg]">
                    ✨
                </span>

                {/* Isi layar */}
                <div
                    className={`relative pt-9 pb-6 px-5 transition-colors duration-500 ${isNeon
                            ? "bg-[radial-gradient(circle_at_0%_0%,rgba(88,28,135,0.3),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(157,23,77,0.25),transparent_50%)]"
                            : "bg-[radial-gradient(circle_at_0%_0%,rgba(243,232,255,0.6),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(252,231,243,0.5),transparent_50%)]"
                        }`}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}
