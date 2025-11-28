// components/PhoneShell.tsx
import { ReactNode } from "react"

type Props = {
    children: ReactNode
}

export default function PhoneShell({ children }: Props) {
    return (
        <div className="relative w-[320px] sm:w-[360px]">
            {/* Bayangan bawah */}
            <div className="absolute inset-x-6 -bottom-6 h-8 rounded-full bg-slate-900/40 blur-xl opacity-70" />

            <div className="relative rounded-[36px] bg-slate-50/90 border border-white/80 shadow-[0_22px_60px_rgba(15,23,42,0.55)] overflow-hidden backdrop-blur">
                {/* Notch atas */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-28 rounded-full bg-slate-200/85 border border-white/60 shadow-inner" />

                {/* Tombol samping */}
                <div className="absolute left-[-3px] top-20 h-12 w-1.5 rounded-r-full bg-slate-300/80" />
                <div className="absolute left-[-3px] top-36 h-7 w-1.5 rounded-r-full bg-slate-300/75" />
                <div className="absolute right-[-3px] top-28 h-16 w-1.5 rounded-l-full bg-slate-300/80" />

                {/* Sticker emoji ala scrapbook */}
                <span className="pointer-events-none absolute -left-2 top-9 text-2xl rotate-[-18deg]">
                    📸
                </span>
                <span className="pointer-events-none absolute -right-2 top-7 text-2xl rotate-[16deg]">
                    🌸
                </span>
                <span className="pointer-events-none absolute -left-1 bottom-6 text-2xl rotate-[10deg]">
                    📱
                </span>
                <span className="pointer-events-none absolute -right-2 bottom-7 text-2xl rotate-[-12deg]">
                    🎀
                </span>

                {/* Isi layar */}
                <div className="relative pt-8 pb-6 px-5 bg-[radial-gradient(circle_at_0_0,rgba(244,244,255,0.9),transparent_55%),radial-gradient(circle_at_100%_0,rgba(255,240,245,0.9),transparent_55%)]">
                    {children}
                </div>
            </div>
        </div>
    )
}
