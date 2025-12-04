/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, memo } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { loadPhotos, clearPhotos } from "../lib/photos"
import { useTheme } from "../components/ThemeContext"

// Ambil tipe Photo dari hasil loadPhotos biar gak perlu export type
type Photo = ReturnType<typeof loadPhotos>[number]

// Memoized photo card to prevent unnecessary re-renders
const PhotoCard = memo(({
    photo,
    isSelected,
    onPreview,
    onToggleSelect,
    isNeon
}: {
    photo: Photo
    isSelected: boolean
    onPreview: (p: Photo) => void
    onToggleSelect: (id: string) => void
    isNeon: boolean
}) => {
    return (
        <div className={`relative rounded-2xl overflow-hidden border shadow-sm transition-colors duration-300 ${isNeon
            ? "bg-purple-900/40 border-purple-700/60"
            : "bg-slate-200/60 border-slate-100"
            }`}>
            <button
                type="button"
                className="block w-full"
                onClick={() => onPreview(photo)}
            >
                <img
                    src={photo.dataUrl}
                    alt="Snapshot"
                    className="h-full w-full object-cover"
                />
            </button>

            {/* Select untuk kolase */}
            <button
                type="button"
                onClick={() => onToggleSelect(photo.id)}
                className={`absolute left-2 top-2 rounded-full border px-2 py-1 text-[10px] flex items-center gap-1 backdrop-blur transition-colors duration-300 ${isSelected
                    ? isNeon
                        ? "bg-fuchsia-500 text-white border-fuchsia-400 shadow-md"
                        : "bg-pink-500 text-white border-pink-400 shadow-md"
                    : isNeon
                        ? "bg-purple-900/75 text-purple-200 border-purple-600/60 hover:bg-purple-800/75"
                        : "bg-white/75 text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
            >
                <span>{isSelected ? "✓" : "⊕"}</span>
                <span>{isSelected ? "Selected" : "Collage"}</span>
            </button>
        </div>
    )
})

PhotoCard.displayName = "PhotoCard"

export default function GalleryPage() {
    const router = useRouter()
    const { theme } = useTheme()
    const isNeon = theme === "neon"
    const [photos, setPhotos] = useState<Photo[]>([])
    const [activePhoto, setActivePhoto] = useState<Photo | null>(null)

    // --- state untuk kolase ---
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [collageUrl, setCollageUrl] = useState<string | null>(null)
    const [isBuildingCollage, setIsBuildingCollage] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const stored = loadPhotos()
        // sort terbaru di atas
        stored.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setPhotos(stored)
    }, [])

    const goHome = () => router.push("/")
    const goCamera = () => router.push("/camera")

    const handleClearAll = () => {
        if (!confirm("Yakin mau hapus semua foto di gallery?")) return
        clearPhotos()
        setPhotos([])
        setSelectedIds([])
    }

    // ========== LOGIKA KOLEKSI / KOLASE ==========

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    const useLatestFour = () => {
        const latest = [...photos]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .slice(0, 4)
            .map((p) => p.id)

        setSelectedIds(latest)
    }

    const handleBuildCollage = async () => {
        const selected = photos.filter((p) => selectedIds.includes(p.id))
        if (selected.length === 0) return
        if (typeof window === "undefined") return

        setIsBuildingCollage(true)
        try {
            // load semua image dulu
            const images = await Promise.all(
                selected.map(
                    (p) =>
                        new Promise<HTMLImageElement>((resolve, reject) => {
                            const img = new Image()
                            img.src = p.dataUrl
                            img.onload = () => resolve(img)
                            img.onerror = (err) => reject(err)
                        }),
                ),
            )

            const canvas = document.createElement("canvas")
            const size = 1200
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext("2d")
            if (!ctx) throw new Error("No canvas context")

            // background gelap lembut
            ctx.fillStyle = "#020617"
            ctx.fillRect(0, 0, size, size)

            const n = images.length
            const max = Math.min(n, 4)
            const used = images.slice(0, max)
            const gap = 16 // Reduced gap for better composition

            // Helper for dynamic rounded corners
            const getRoundedRadius = (cellW: number) => {
                return Math.min(cellW * 0.08, 40)
            }

            if (max === 1) {
                // 1 foto: full center dengan margin
                const img = used[0]
                const targetW = size - gap * 2
                const targetH = size - gap * 2
                ctx.save()
                ctx.beginPath()
                const r = getRoundedRadius(targetW)
                roundRect(ctx, gap, gap, targetW, targetH, r)
                ctx.clip()
                drawCover(img, ctx, gap, gap, targetW, targetH)
                ctx.restore()
            } else if (max === 2) {
                // 2 foto: atas & bawah
                const cellH = (size - gap * 3) / 2
                const cellW = size - gap * 2
                const r = getRoundedRadius(cellW)

                used.forEach((img, i) => {
                    const x = gap
                    const y = gap + i * (cellH + gap)
                    ctx.save()
                    ctx.beginPath()
                    roundRect(ctx, x, y, cellW, cellH, r)
                    ctx.clip()
                    drawCover(img, ctx, x, y, cellW, cellH)
                    ctx.restore()
                })
            } else {
                // 3 atau 4 foto: grid 2x2
                const cellW = (size - gap * 3) / 2
                const cellH = (size - gap * 3) / 2
                const r = getRoundedRadius(cellW)

                used.forEach((img, i) => {
                    const row = Math.floor(i / 2)
                    const col = i % 2
                    const x = gap + col * (cellW + gap)
                    const y = gap + row * (cellH + gap)
                    ctx.save()
                    ctx.beginPath()
                    roundRect(ctx, x, y, cellW, cellH, r)
                    ctx.clip()
                    drawCover(img, ctx, x, y, cellW, cellH)
                    ctx.restore()
                })
            }

            // strip bawah dengan title + watermark
            const barH = 120
            const barY = size - barH
            const grad = ctx.createLinearGradient(0, barY, 0, size)
            grad.addColorStop(0, "rgba(2,6,23,0.5)")
            grad.addColorStop(0.3, "rgba(15,23,42,0.85)")
            grad.addColorStop(1, "rgba(15,23,42,0.98)")
            ctx.fillStyle = grad
            ctx.fillRect(0, barY, size, barH)

            ctx.fillStyle = "rgba(248,250,252,0.98)"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = `600 ${size * 0.048}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
            ctx.fillText("Smile Photobooth", size / 2, barY + barH / 2 - 14)

            ctx.fillStyle = "rgba(148,163,184,0.96)"
            ctx.textAlign = "right"
            ctx.font = `500 ${size * 0.026}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
            ctx.fillText("@lentera.photobooth", size - 40, size - 28)

            const url = canvas.toDataURL("image/png")
            setCollageUrl(url)
        } catch (e) {
            console.error(e)
            alert("Gagal membuat kolase. Coba lagi ya 🙏")
        } finally {
            setIsBuildingCollage(false)
        }
    }

    const handleDownloadCollage = () => {
        if (!collageUrl) return
        const a = document.createElement("a")
        a.href = collageUrl
        a.download = `smile-collage-${Date.now()}.png`
        a.click()
    }

    const selectedCount = selectedIds.length

    // ========== RENDER ==========

    const isEmpty = photos.length === 0

    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goHome}
                            className={`text-xs rounded-full border px-3 py-1 transition-colors duration-300 flex items-center gap-1 ${isNeon
                                ? "border-purple-400/60 text-purple-200 hover:bg-purple-500/10"
                                : "border-purple-200 text-purple-700 hover:bg-purple-100"
                                }`}
                        >
                            ← <span>Home</span>
                        </button>
                        <div className="text-right">
                            <p className={`text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${isNeon ? "text-purple-400" : "text-purple-500"
                                }`}>
                                gallery
                            </p>
                            <p className={`text-sm font-semibold transition-colors duration-300 ${isNeon ? "text-fuchsia-100" : "text-purple-900"
                                }`}>
                                Your snapshots
                            </p>
                        </div>
                    </div>

                    {/* Top info bar */}
                    <div className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-[11px] shadow-sm transition-colors duration-300 ${isNeon
                        ? "bg-purple-900/40 border-purple-700/60"
                        : "bg-white/80 border-slate-100"
                        }`}>
                        <span className={`transition-colors duration-300 ${isNeon ? "text-purple-200" : "text-slate-600"
                            }`}>
                            {isEmpty
                                ? "Belum ada foto, cobain kamera dulu 😆"
                                : `Total ${photos.length} foto tersimpan di browser ini`}
                        </span>
                        {!isEmpty && (
                            <button
                                onClick={handleClearAll}
                                className="rounded-full border border-red-400/60 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors duration-300"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {isEmpty ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
                            {/* Animated illustration */}
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center shadow-lg">
                                    <span className="text-6xl animate-bounce">📸</span>
                                </div>
                                <span className="absolute -right-2 -top-2 text-3xl animate-[spin_3s_linear_infinite]">✨</span>
                            </div>

                            <div className="text-center">
                                <p className={`text-sm font-medium transition-colors duration-300 ${isNeon ? "text-fuchsia-100" : "text-purple-800"
                                    }`}>Gallery masih kosong</p>
                                <p className={`text-xs mt-1 transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                                    }`}>Yuk ambil foto pertama kamu!</p>
                            </div>

                            <button
                                onClick={goCamera}
                                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.7)] hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(16,185,129,0.8)] transition-all flex items-center gap-2"
                            >
                                <span>📷</span>
                                <span>Buka Kamera</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Kolase control */}
                            <div className="rounded-2xl bg-white/85 border border-slate-100 px-3 py-3 text-[11px] shadow-sm flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className={`rounded-full text-[9px] px-2 py-0.5 transition-colors duration-300 ${isNeon ? "bg-fuchsia-500 text-white" : "bg-purple-600 text-white"
                                            }`}>
                                            NEW
                                        </span>
                                        <span className={`font-medium transition-colors duration-300 ${isNeon ? "text-purple-100" : "text-purple-800"
                                            }`}>
                                            Collage mode
                                        </span>
                                    </div>
                                    <span className={`transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                                        }`}>
                                        {selectedCount} selected
                                    </span>
                                </div>
                                <p className={`text-[10px] transition-colors duration-300 ${isNeon ? "text-purple-400" : "text-purple-600"
                                    }`}>
                                    Tap ikon ⊕ di tiap foto untuk memilih (max 4). Lalu tekan
                                    &quot;Build collage&quot;.
                                </p>
                                <div className="mt-1 flex gap-2 text-[10px]">
                                    <button
                                        onClick={handleBuildCollage}
                                        disabled={selectedCount === 0 || isBuildingCollage}
                                        className={`flex-1 rounded-full px-3 py-2 font-semibold transition flex items-center justify-center gap-1 ${selectedCount === 0 || isBuildingCollage
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-emerald-600 text-white shadow-[0_10px_25px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,185,129,0.8)]"
                                            }`}
                                    >
                                        {isBuildingCollage ? (
                                            <>
                                                <span className="h-2 w-2 animate-ping rounded-full bg-white/80" />
                                                <span>Building...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🎨</span>
                                                <span>Build collage</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={useLatestFour}
                                        className={`rounded-full border px-3 py-2 transition-colors duration-300 whitespace-nowrap ${isNeon
                                            ? "border-purple-600/60 bg-purple-900/50 text-purple-200 hover:bg-purple-800/60"
                                            : "border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
                                            }`}
                                    >
                                        Use latest 4
                                    </button>
                                </div>
                            </div>

                            {/* Grid foto */}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {photos.map((p) => (
                                    <PhotoCard
                                        key={p.id}
                                        photo={p}
                                        isSelected={selectedIds.includes(p.id)}
                                        onPreview={setActivePhoto}
                                        onToggleSelect={toggleSelect}
                                        isNeon={isNeon}
                                    />
                                ))}
                            </div>
                        </>
                    )
                    }
                </div >
            </PhoneShell >

            {/* Modal preview single photo */}
            {
                activePhoto && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                        <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300 ${isNeon ? "bg-purple-950/95" : "bg-slate-50"
                            }`}>
                            <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${isNeon ? "border-purple-800/60" : "border-slate-200"
                                }`}>
                                <p className={`text-xs font-medium transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-slate-600"
                                    }`}>
                                    Preview photo
                                </p>
                                <button
                                    onClick={() => setActivePhoto(null)}
                                    className={`text-[11px] transition-colors duration-300 ${isNeon
                                        ? "text-purple-300 hover:text-fuchsia-200"
                                        : "text-slate-500 hover:text-slate-800"
                                        }`}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-4 pb-5 flex flex-col gap-3">
                                <div className={`rounded-2xl overflow-hidden transition-colors duration-300 ${isNeon ? "bg-purple-900/40" : "bg-slate-200"
                                    }`}>
                                    <img
                                        src={activePhoto.dataUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const a = document.createElement("a")
                                        a.href = activePhoto.dataUrl
                                        a.download = `smile-photo-${activePhoto.id}.png`
                                        a.click()
                                    }}
                                    className={`mt-1 w-full rounded-full py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(236,72,153,0.7)] hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(236,72,153,0.8)] transition-all duration-300 ${isNeon
                                        ? "bg-fuchsia-600"
                                        : "bg-gradient-to-r from-pink-500 to-purple-500"
                                        }`}
                                >
                                    Download photo
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal hasil kolase */}
            {
                collageUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
                        <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300 ${isNeon ? "bg-purple-950/95" : "bg-slate-50"
                            }`}>
                            <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${isNeon ? "border-purple-800/60" : "border-slate-200"
                                }`}>
                                <p className={`text-xs font-medium transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-slate-600"
                                    }`}>
                                    Collage preview
                                </p>
                                <button
                                    onClick={() => setCollageUrl(null)}
                                    className={`text-[11px] transition-colors duration-300 ${isNeon
                                        ? "text-purple-300 hover:text-fuchsia-200"
                                        : "text-purple-600 hover:text-purple-800"
                                        }`}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-4 pb-5 flex flex-col gap-3">
                                <div className="rounded-2xl overflow-hidden bg-slate-900">
                                    <img
                                        src={collageUrl}
                                        alt="Collage preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <button
                                    onClick={handleDownloadCollage}
                                    className={`mt-1 w-full rounded-full py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(236,72,153,0.7)] hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(236,72,153,0.8)] transition-all duration-300 ${isNeon
                                        ? "bg-fuchsia-600"
                                        : "bg-gradient-to-r from-pink-500 to-purple-500"
                                        }`}
                                >
                                    Download collage
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </Layout >
    )
}

/**
 * Helper: gambar image cover ke area target
 */
function drawCover(
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
) {
    const imgRatio = img.width / img.height
    const targetRatio = w / h

    let drawW = w
    let drawH = h
    let offsetX = 0
    let offsetY = 0

    if (imgRatio > targetRatio) {
        // gambar lebih lebar → crop kiri/kanan
        drawH = h
        drawW = h * imgRatio
        offsetX = (w - drawW) / 2
    } else {
        // gambar lebih tinggi → crop atas/bawah
        drawW = w
        drawH = w / imgRatio
        offsetY = (h - drawH) / 2
    }

    ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH)
}

/**
 * Helper: rounded rect
 */
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}
