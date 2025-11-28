// pages/index.tsx
import Link from "next/link"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"

export default function Home() {
    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col items-center gap-6">
                    {/* SLOT FOTO DESIGN / PREVIEW */}
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
                        <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                            personal photobooth
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                            Smile Photobooth
                        </h1>
                        <p className="mt-0.5 text-[11px] text-slate-500">by Lentera ✨</p>
                    </div>

                    {/* Badge status */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100 text-[10px] text-emerald-700 shadow-sm">
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
                    <p className="mt-1 text-[11px] text-slate-500 text-center">
                        Foto disimpan lokal di browser kamu. Main aman tanpa upload ke
                        mana-mana 😉
                    </p>
                </div>
            </PhoneShell>
        </Layout>
    )
}
