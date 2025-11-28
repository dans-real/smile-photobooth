// pages/index.tsx
import Link from "next/link"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"

export default function Home() {
    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                            personal
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                            Smile Photobooth
                        </h1>
                        <p className="mt-1 text-[11px] text-slate-500">
                            by <span className="font-medium">you</span> ✨
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <Link
                            href="/camera"
                            className="w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.55)] hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(16,185,129,0.65)] active:translate-y-[1px] active:shadow-[0_8px_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                        >
                            <span>📷</span>
                            <span>Open Camera</span>
                        </Link>
                        <Link
                            href="/gallery"
                            className="w-full rounded-xl bg-white/80 py-3 text-center text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-center gap-2"
                        >
                            <span>🖼️</span>
                            <span>View Gallery</span>
                        </Link>
                    </div>

                    <div className="w-full rounded-2xl bg-white/70 border border-slate-100 px-3 py-2 text-[11px] text-slate-500 text-center shadow-sm">
                        <p>
                            Semua foto disimpan <span className="font-semibold">lokal</span> di
                            browser kamu. Cocok buat main-main sendiri tanpa upload ke mana-mana 😉
                        </p>
                    </div>
                </div>
            </PhoneShell>
        </Layout>
    )
}
