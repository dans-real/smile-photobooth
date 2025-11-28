// components/PhoneShell.tsx
import type { ReactNode } from "react"

type Props = {
    children: ReactNode
}

export default function PhoneShell({ children }: Props) {
    return (
        <div className="relative w-[320px] sm:w-[360px] float-card">
            {/* Bayangan bawah */}
            <div className="absolute inset-x-6 -bottom-7 h-9 rounded-full bg-sky-900/40 blur-2xl opacity-70" />

            <div className="relative rounded-[34px] bg-slate-50/95 border border-white/80 shadow-[0_22px_60px_rgba(15,23,42,0.65)] overflow-hidden backdrop-blur transition-transform duration-300 ease-out hover:-translate-y-1">
                {/* Notch atas */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-32 rounded-full bg-slate-200/90 border border-white/70 shadow-inner" />

                {/* Tombol samping */}
                <div className="absolute left-[-3px] top-24 h-12 w-1.5 rounded-r-full bg-slate-300/85" />
                <div className="absolute left-[-3px] top-40 h-7 w-1.5 rounded-r-full bg-slate-300/75" />
                <div className="absolute right-[-3px] top-32 h-16 w-1.5 rounded-l-full bg-slate-300/85" />

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
                <div className="relative pt-9 pb-6 px-5 bg-[radial-gradient(circle_at_0_0,rgba(244,244,255,0.95),transparent_55%),radial-gradient(circle_at_100%_0,rgba(255,240,245,0.95),transparent_55%)]">
                    {children}
                </div>
            </div>
        </div>
    )
}
