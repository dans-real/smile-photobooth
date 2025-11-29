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
                        className={`flex w-full items-center justify-between text-[11px] ${isNeon ? "text-slate-200" : "text-slate-500"
                            }`}
                    >
                        <span
                            className={`rounded-full px-2 py-1 backdrop-blur text-[10px] border ${isNeon
                                ? "bg-slate-900/80 border-fuchsia-400/70 text-fuchsia-100"
                                : "bg-white/70 border-slate-200 text-slate-600"
                                }`}
                        >
                            ✨ Personal photobooth
                        </span>

                        <button
                            onClick={toggleTheme}
                            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition ${isNeon
                                ? "border-fuchsia-400/70 bg-slate-900/80 text-fuchsia-100 hover:bg-slate-800"
                                : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100"
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
                            className={`mt-1 text-2xl font-semibold tracking-tight ${isNeon ? "text-slate-50" : "text-slate-900"
                                }`}
                        >
                            Smile Photobooth
                        </h1>
                        <p
                            className={`mt-0.5 text-[11px] ${isNeon ? "text-slate-300" : "text-slate-500"
                                }`}
                        >
                            by Lentera ✨
                        </p>
                    </div>

                    {/* Badge status */}
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border text-[10px] shadow-sm ${isNeon
                                ? "bg-emerald-500/10 border-emerald-400/60 text-emerald-100"
                                : "bg-emerald-50 border-emerald-100 text-emerald-700"
                            }`}
                    >

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>local only · no cloud · just vibes and enjoy</span>
                    </div>

                    {/* Tombol utama */}
                    <div className="flex flex-col w-full gap-2.5">
                        <Link
                            href="/camera"
                            className="w-full rounded-2xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_40px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(16,185,129,0.7)] active:translate-y-0 transition-all inline-flex items-center justify-center gap-2"
                        >
                            <span>📷</span>
                            <span>Open Camera</span>
                        </Link>
                        <Link
                            href="/gallery"
                            className="w-full rounded-2xl bg-white/85 py-3 text-center text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_10px_25px_rgba(148,163,184,0.3)] hover:shadow-[0_14px_32px_rgba(148,163,184,0.45)] transition-all inline-flex items-center justify-center gap-2"
                        >
                            <span>🖼️</span>
                            <span>View Gallery</span>
                        </Link>
                    </div>

                    {/* Info singkat */}
                    <p
                        className={`mt-1 text-[11px] text-center ${isNeon ? "text-slate-300" : "text-slate-500"
                            }`}
                    >
                        Foto disimpan lokal di browser kamu. Main aman tanpa upload ke mana-mana 😉
                    </p>
                </div>
            </PhoneShell>
        </Layout>
    )
}
