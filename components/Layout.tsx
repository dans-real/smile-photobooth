// components/Layout.tsx
import { ReactNode } from "react"

type Props = { children: ReactNode }

export default function Layout({ children }: Props) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-200 via-sky-300 to-sky-500 flex items-center justify-center">
            {/* Cloud glow di bawah */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[-140px] h-[260px] bg-[radial-gradient(circle_at_50%_-20%,white,transparent_60%)] opacity-90" />
            {/* Sedikit noise / haze */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.25),transparent_55%)] mix-blend-screen opacity-70" />
            <div className="relative z-10 p-4 sm:p-6">
                {children}
            </div>
        </div>
    )
}
