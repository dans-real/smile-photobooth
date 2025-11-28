// components/Layout.tsx
import type { ReactNode } from "react"

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-10 sm:py-12">
            {/* Cloud glow bawah */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[-200px] h-[260px] bg-[radial-gradient(circle_at_50%_-10%,white,transparent_60%)] opacity-80" />
            {/* Haze kiri-kanan */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.45),transparent_60%),radial-gradient(circle_at_85%_5%,rgba(255,255,255,0.28),transparent_60%)] mix-blend-screen opacity-70" />

            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
