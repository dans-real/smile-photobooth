// pages/gallery.tsx
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { clearPhotos, loadPhotos, type Photo } from "../lib/photos"

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([])
    const [active, setActive] = useState<Photo | null>(null)
    const router = useRouter()

    useEffect(() => {
        const stored = loadPhotos()
        setPhotos(stored)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const handleClear = () => {
        if (photos.length === 0) return
        if (confirm("Yakin mau hapus semua foto di gallery?")) {
            clearPhotos()
            setPhotos([])
            setActive(null)
        }
    }

    const goHome = () => router.push("/")
    const goCamera = () => router.push("/camera")

    return (
        <Layout>
            <PhoneShell>
                <div className="flex h-[520px] flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goHome}
                            className="text-xs rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100 transition flex items-center gap-1"
                        >
                            ← <span>Home</span>
                        </button>
                        <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                gallery
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                                Your snapshots
                            </p>
                        </div>
                    </div>

                    {/* Info bar */}
                    <div className="flex items-center justify-between rounded-2xl bg-white/85 border border-slate-100 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                        <span>
                            {photos.length === 0
                                ? "Belum ada foto, cobain kamera dulu 😉"
                                : `${photos.length} photo${photos.length > 1 ? "s" : ""} saved locally`}
                        </span>
                        <button
                            onClick={handleClear}
                            className="rounded-full border border-red-300 px-2.5 py-1 text-[10px] text-red-500 hover:bg-red-50 transition"
                        >
                            Clear all
                        </button>
                    </div>

                    {/* Content */}
                    {photos.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-500 text-sm">
                            <p>Gallery masih kosong 🥹</p>
                            <button
                                onClick={goCamera}
                                className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,185,129,0.7)] active:translate-y-0.5 transition-all flex items-center gap-1"
                            >
                                <span>📷</span>
                                <span>Go to camera</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-100/80 border border-slate-100 p-2">
                            <div className="grid grid-cols-2 gap-2 pb-2">
                                {photos.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActive(p)}
                                        className="relative aspect-3/4 overflow-hidden rounded-2xl bg-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                    >
                                        <img
                                            src={p.dataUrl}
                                            alt="Captured"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[9px] text-slate-50">
                                            tap to view
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modal preview */}
                    {active && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65"
                            onClick={() => setActive(null)}
                        >
                            <div
                                className="w-[320px] rounded-3xl bg-slate-50/95 border border-white/80 p-3 shadow-[0_20px_55px_rgba(15,23,42,0.9)] backdrop-blur-sm flex flex-col gap-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500">
                                        Preview photo
                                    </span>
                                    <button
                                        onClick={() => setActive(null)}
                                        className="text-[11px] rounded-full border border-slate-200 px-2.5 py-0.5 text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="aspect-3/4 overflow-hidden rounded-2xl bg-slate-200">
                                    <img
                                        src={active.dataUrl}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <a
                                    href={active.dataUrl}
                                    download={`photobooth-${active.id}.png`}
                                    className="w-full rounded-full bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.65)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(16,185,129,0.75)] active:translate-y-0.5 transition-all"
                                >
                                    Download photo
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </PhoneShell>
        </Layout>
    )
}
