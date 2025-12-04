// pages/index.tsx
import Link from "next/link"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { useTheme } from "../components/ThemeContext"

export default function Home() {
    const { theme, toggleTheme } = useTheme()
    const isNeon = theme === "neon"

    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col items-center gap-6">
                    {/* TOP BAR: theme toggle */}
                    <div
                        className={`flex w-full items-center justify-between text-[11px] transition-colors duration-300 ${isNeon ? "text-purple-200" : "text-purple-600"
                            }`}
                    >
                        <span
                            className={`rounded-full px-2 py-1 backdrop-blur text-[10px] border transition-colors duration-300 ${isNeon
                                ? "bg-purple-900/80 border-fuchsia-400/70 text-fuchsia-100"
                                : "bg-white/70 border-purple-200 text-purple-700"
                                }`}
                        >
                            ✨ Personal photobooth
                        </span>

                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition-colors duration-300 ${isNeon
                                ? "border-fuchsia-400/70 bg-purple-900/80 text-fuchsia-100 hover:bg-purple-800"
                                : "border-purple-200 bg-white/80 text-purple-700 hover:bg-purple-50"
                                }`}
                        >
                            <span>{isNeon ? "🌌" : "☁️"}</span>
                            <span>{isNeon ? "Neon mode" : "Sky mode"}</span>
                        </button>
                    </div>


                    {/* SLOT FOTO DESIGN / PREVIEW */}
                    <div className="w-full rounded-3xl bg-slate-100/80 border border-slate-100 shadow-inner overflow-hidden">
                        <img
                            src="https://picsum.photos/640/480?random=1"
                            alt="Sample photobooth preview"
                            className="w-full h-full object-cover aspect-[4/3]"
                        />
                    </div>

                    {/* Header title */}
                    <div className="text-center">
                        <h1
                            className={`mt-1 text-2xl font-semibold tracking-tight transition-colors duration-300 ${isNeon ? "text-fuchsia-50" : "text-purple-900"
                                }`}
                        >
                            Smile Photobooth
                        </h1>
                        <p
                            className={`mt-0.5 text-[11px] transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                                }`}
                        >
                            by Lentera ✨
                        </p>
                    </div>

                    {/* Badge status */}
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border text-[10px] shadow-sm transition-colors duration-300 ${isNeon
                                ? "bg-cyan-500/10 border-cyan-400/60 text-cyan-100"
                                : "bg-teal-50 border-teal-200 text-teal-700"
                            }`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                        <span>local only · no cloud · just vibes and enjoy</span>
                    </div>

                    {/* Tombol utama */}
                    <div className="flex flex-col w-full gap-2.5">
                        <Link
                            href="/camera"
                            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_40px_rgba(236,72,153,0.6)] hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(236,72,153,0.7)] active:translate-y-0 transition-all inline-flex items-center justify-center gap-2 btn-ripple"
                        >
                            <span>📷</span>
                            <span>Open Camera</span>
                        </Link>
                        <Link
                            href="/gallery"
                            className="w-full rounded-2xl bg-white/85 py-3 text-center text-sm font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_10px_25px_rgba(168,85,247,0.3)] hover:shadow-[0_14px_32px_rgba(168,85,247,0.45)] transition-all inline-flex items-center justify-center gap-2 btn-ripple"
                        >
                            <span>🖼️</span>
                            <span>View Gallery</span>
                        </Link>
                    </div>

                    {/* Info singkat */}
                    <p
                        className={`mt-1 text-[11px] text-center transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                            }`}
                    >
                        Take a picture for free and dont worry about your privacy, we used temporary storage 😉
                    </p>
                </div>
            </PhoneShell>
        </Layout>
    )
}


