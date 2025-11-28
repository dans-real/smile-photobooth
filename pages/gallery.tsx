// pages/gallery.tsx
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { clearPhotos, loadPhotos, Photo } from "../lib/photos"

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Photo[]>([])
    const [active, setActive] = useState<Photo | null>(null)
    const router = useRouter()

    useEffect(() => {
        const stored = loadPhotos()
        setPhotos(stored)
    }, [])

    const handleClear = () => {
        if (confirm("Yakin mau hapus semua foto?")) {
            clearPhotos()
            setPhotos([])
            setActive(null)
        }
    }

    const goBack = () => router.push("/")

    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col gap-4 h-[520px]">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-slate-800">Gallery</h1>
                        <button
                            onClick={goBack}
                            className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100"
                        >
                            Home
                        </button>
                    </div>

                    {photos.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
                            <p>Belum ada foto nih 🥹</p>
                            <button
                                onClick={() => router.push("/camera")}
                                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white"
                            >
                                Ambil foto dulu
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2 pb-3">
                                    {photos.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActive(p)}
                                            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-200"
                                        >
                                            <img
                                                src={p.dataUrl}
                                                alt="Captured"
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">
                                    {photos.length} photo{photos.length > 1 ? "s" : ""}
                                </span>
                                <button
                                    onClick={handleClear}
                                    className="px-3 py-1 rounded-full border border-red-400 text-red-500 hover:bg-red-50"
                                >
                                    Clear all
                                </button>
                            </div>
                        </>
                    )}

                    {/* Modal preview */}
                    {active && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                            onClick={() => setActive(null)}
                        >
                            <div
                                className="w-[320px] rounded-2xl bg-white p-3 flex flex-col gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-200">
                                    <img
                                        src={active.dataUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <a
                                    href={active.dataUrl}
                                    download={`photobooth-${active.id}.png`}
                                    className="w-full rounded-lg bg-emerald-600 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 transition"
                                >
                                    Download
                                </a>
                                <button
                                    onClick={() => setActive(null)}
                                    className="w-full rounded-lg border border-slate-300 py-2 text-xs text-slate-700 hover:bg-slate-100"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </PhoneShell>
        </Layout>
    )
}
