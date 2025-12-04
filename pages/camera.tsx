/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { savePhoto, getStorageInfo } from "../lib/photos"

type FrameStyle = "polaroid" | "clean" | "film"

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [ready, setReady] = useState(false)
    const [taking, setTaking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [flash, setFlash] = useState(false)
    const [justSaved, setJustSaved] = useState(false)
    const [frameStyle, setFrameStyle] = useState<FrameStyle>("polaroid")
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
    const [storageWarning, setStorageWarning] = useState(false)
    const [estimatedPhotosLeft, setEstimatedPhotosLeft] = useState(50)

    const router = useRouter()

    // Check storage on mount
    useEffect(() => {
        if (typeof window === "undefined") return
        const info = getStorageInfo()
        setEstimatedPhotosLeft(info.estimatedPhotosLeft)
        if (info.estimatedPhotosLeft < 5) {
            setStorageWarning(true)
        }
    }, [])

    // Init camera setiap facingMode berubah
    useEffect(() => {
        let cancelled = false

        async function initCamera() {
            setError(null)
            setReady(false)

            // stop stream lama dulu
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Browser kamu belum support kamera.")
                return
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode },
                    audio: false,
                })
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    setReady(true)
                }
            } catch (err) {
                console.error(err)
                let message = "Gagal mengakses kamera 😭"

                if (err instanceof Error) {
                    if (err.name === "NotAllowedError") {
                        message = "Kamu belum izinkan akses kamera. Klik ikon kamera di address bar browser, lalu Allow 📷"
                    } else if (err.name === "NotFoundError") {
                        message = "Kamera tidak ditemukan di device ini 😢"
                    } else if (err.name === "NotReadableError") {
                        message = "Kamera sedang dipakai aplikasi lain. Tutup dulu aplikasi lain ya 🙏"
                    }
                }

                setError(message)
            }
        }

        initCamera()

        return () => {
            cancelled = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
            }
            // Clear canvas to prevent memory leak
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d")
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                }
            }
        }
    }, [facingMode])

    const handleTakePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return
        setTaking(true)

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            setTaking(false)
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame (NOT mirrored - so text is readable)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const width = canvas.width
        const height = canvas.height

        const brandTitle = "Smile Photobooth"
        const watermark = "@lentera.photobooth"
        const baseFont =
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

        // ========== FRAME STYLES ==========

        if (frameStyle === "polaroid") {
            // Create new canvas for polaroid frame
            const frameCanvas = document.createElement("canvas")
            const borderBottom = height * 0.12
            const borderSide = width * 0.08
            const borderTop = width * 0.08

            frameCanvas.width = width + borderSide * 2
            frameCanvas.height = height + borderTop + borderBottom

            const fctx = frameCanvas.getContext("2d")
            if (fctx) {
                // White background
                fctx.fillStyle = "#ffffff"
                fctx.fillRect(0, 0, frameCanvas.width, frameCanvas.height)

                // Draw photo
                fctx.drawImage(canvas, borderSide, borderTop)

                // Add shadow
                fctx.shadowColor = "rgba(0,0,0,0.1)"
                fctx.shadowBlur = 20
                fctx.shadowOffsetY = 10

                // Bottom label
                const labelY = height + borderTop + borderBottom / 2
                fctx.fillStyle = "#1e293b"
                fctx.textAlign = "center"
                fctx.textBaseline = "middle"
                fctx.font = `600 ${width * 0.045}px ${baseFont}`
                fctx.fillText(brandTitle, frameCanvas.width / 2, labelY - borderBottom * 0.15)

                // Watermark
                fctx.fillStyle = "#64748b"
                fctx.font = `500 ${width * 0.028}px ${baseFont}`
                fctx.fillText(watermark, frameCanvas.width / 2, labelY + borderBottom * 0.12)

                // Copy back to main canvas
                canvas.width = frameCanvas.width
                canvas.height = frameCanvas.height
                ctx.drawImage(frameCanvas, 0, 0)
            }
        } else if (frameStyle === "clean") {
            // Minimalist white border
            const frameCanvas = document.createElement("canvas")
            const border = width * 0.04

            frameCanvas.width = width + border * 2
            frameCanvas.height = height + border * 3

            const fctx = frameCanvas.getContext("2d")
            if (fctx) {
                // White background
                fctx.fillStyle = "#fafafa"
                fctx.fillRect(0, 0, frameCanvas.width, frameCanvas.height)

                // Draw photo with subtle shadow
                fctx.shadowColor = "rgba(0,0,0,0.08)"
                fctx.shadowBlur = 15
                fctx.drawImage(canvas, border, border)

                // Bottom watermark
                const labelY = height + border * 2.2
                fctx.fillStyle = "#94a3b8"
                fctx.textAlign = "right"
                fctx.textBaseline = "middle"
                fctx.font = `500 ${width * 0.025}px ${baseFont}`
                fctx.fillText(watermark, frameCanvas.width - border * 1.5, labelY)

                // Brand on left
                fctx.textAlign = "left"
                fctx.fillStyle = "#cbd5e1"
                fctx.fillText(brandTitle, border * 1.5, labelY)

                // Copy back
                canvas.width = frameCanvas.width
                canvas.height = frameCanvas.height
                ctx.drawImage(frameCanvas, 0, 0)
            }
        } else if (frameStyle === "film") {
            // Film strip style
            const frameCanvas = document.createElement("canvas")
            const stripW = width * 0.08
            const borderTop = width * 0.06
            const borderBottom = width * 0.08

            frameCanvas.width = width + stripW * 2
            frameCanvas.height = height + borderTop + borderBottom

            const fctx = frameCanvas.getContext("2d")
            if (fctx) {
                // Black background
                fctx.fillStyle = "#0f172a"
                fctx.fillRect(0, 0, frameCanvas.width, frameCanvas.height)

                // Draw photo
                fctx.drawImage(canvas, stripW, borderTop)

                // Film holes on left
                const holeSize = stripW * 0.4
                const holeGap = height / 8
                fctx.fillStyle = "#1e293b"
                for (let i = 0; i < 7; i++) {
                    const y = borderTop + i * holeGap + holeGap / 2
                    fctx.fillRect(stripW * 0.3, y - holeSize / 2, holeSize, holeSize)
                    fctx.fillRect(frameCanvas.width - stripW * 0.3 - holeSize, y - holeSize / 2, holeSize, holeSize)
                }

                // Top strip label
                fctx.fillStyle = "#f1f5f9"
                fctx.textAlign = "left"
                fctx.textBaseline = "middle"
                fctx.font = `600 ${width * 0.035}px ${baseFont}`
                fctx.fillText(brandTitle, stripW * 2, borderTop / 2)

                // Bottom watermark
                fctx.fillStyle = "#94a3b8"
                fctx.textAlign = "right"
                fctx.font = `500 ${width * 0.028}px ${baseFont}`
                fctx.fillText(watermark, frameCanvas.width - stripW * 2, height + borderTop + borderBottom / 2)

                // Copy back
                canvas.width = frameCanvas.width
                canvas.height = frameCanvas.height
                ctx.drawImage(frameCanvas, 0, 0)
            }
        }

        // --- SCALE DOWN supaya hemat storage ---
        let targetCanvas: HTMLCanvasElement = canvas

        // Maksimal sisi 1200px biar file nggak kegedean
        const maxSide = 1200
        if (canvas.width > maxSide || canvas.height > maxSide) {
            const scale = Math.min(maxSide / canvas.width, maxSide / canvas.height)
            const w = Math.round(canvas.width * scale)
            const h = Math.round(canvas.height * scale)

            const tmp = document.createElement("canvas")
            tmp.width = w
            tmp.height = h
            const tctx = tmp.getContext("2d")
            if (tctx) {
                tctx.drawImage(canvas, 0, 0, w, h)
                targetCanvas = tmp
            }
        }

        // JPEG + quality 0.85 → jauh lebih kecil daripada PNG
        const dataUrl = targetCanvas.toDataURL("image/jpeg", 0.85)

        const photo = {
            id: crypto.randomUUID(),
            dataUrl,
            createdAt: new Date().toISOString(),
        }

        const ok = savePhoto(photo)

        if (!ok) {
            // Kalau gagal (kemungkinan besar quota full), kasih info ke user
            alert(
                "Penyimpanan browser sudah penuh 😭\n" +
                "Buka Gallery lalu hapus beberapa foto (Clear all atau hapus manual), kemudian coba foto lagi ya."
            )
            setTaking(false)
            return
        }

        // Efek flash
        setFlash(true)
        setTimeout(() => setFlash(false), 220)

        // Notif kecil bahwa foto tersimpan
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 1400)

        setTaking(false)
    }


    const goBackHome = () => router.push("/")
    const goGallery = () => router.push("/gallery")
    const toggleFacing = () =>
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"))

    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goBackHome}
                            className="text-xs rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100 transition flex items-center gap-1"
                        >
                            ← <span>Home</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFacing}
                                className="text-[11px] rounded-full border border-slate-300 px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition flex items-center gap-1"
                            >
                                🔁
                                <span>{facingMode === "user" ? "Front" : "Back"}</span>
                            </button>
                            <div className="text-right">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                    camera
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                    Capture mode
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Storage warning */}
                    {storageWarning && (
                        <div className="flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-400/60 text-amber-700 px-3 py-1.5 text-[10px]">
                            <span>⚠️</span>
                            <span>Storage hampir penuh! Sisa ~{estimatedPhotosLeft} foto</span>
                        </div>
                    )}

                    {/* Preview kamera */}
                    <div className="rounded-3xl bg-slate-200/80 p-1.5 border border-slate-100 shadow-inner">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-[26px] bg-slate-900">
                            {error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                                    <p className="text-xs text-slate-200">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition flex items-center gap-1"
                                    >
                                        <span>🔄</span>
                                        <span>Retry</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        className="h-full w-full object-cover"
                                        style={{ transform: "scaleX(-1)" }}
                                        playsInline
                                        muted
                                    />
                                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-slate-50">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span>LIVE</span>
                                        <span className="ml-1 opacity-80">
                                            {facingMode === "user" ? "Front" : "Back"}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Flash overlay */}
                            {flash && (
                                <div
                                    className="pointer-events-none absolute inset-0 bg-white/80"
                                    style={{
                                        animation: "camera-flash 220ms ease-out forwards",
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Canvas hidden untuk capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Frame selector */}
                    <div className="flex w-full items-center justify-center gap-2 text-[10px]">
                        {(
                            [
                                ["polaroid", "Polaroid"],
                                ["clean", "Clean"],
                                ["film", "Film"],
                            ] as [FrameStyle, string][]
                        ).map(([value, label]) => {
                            const active = frameStyle === value
                            return (
                                <button
                                    key={value}
                                    onClick={() => setFrameStyle(value)}
                                    className={`rounded-full px-3 py-1 border transition flex items-center gap-1 ${active
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "border-slate-200 bg-white/70 text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    <span>
                                        {value === "polaroid"
                                            ? "📷"
                                            : value === "clean"
                                                ? "✨"
                                                : "🎞️"}
                                    </span>
                                    <span>{label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Control bar bawah */}
                    <div className="flex flex-col items-center gap-2">
                        {/* Shutter button */}
                        <button
                            onClick={handleTakePhoto}
                            disabled={!ready || taking || !!error}
                            className="relative flex items-center justify-center disabled:opacity-60"
                        >
                            <span className="absolute h-14 w-14 rounded-full bg-emerald-500/45 blur-lg" />
                            <span className="relative h-14 w-14 rounded-full bg-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.7)] border-4 border-emerald-100 hover:scale-105 active:scale-95 transition-transform" />
                        </button>

                        {/* Info + notif saved */}
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[11px] text-slate-500">
                                Tap tombol bulat untuk ambil foto
                            </p>
                            {justSaved && (
                                <div
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-[11px] px-3 py-1 shadow-[0_10px_25px_rgba(16,185,129,0.7)]"
                                    style={{ animation: "toast-pop 180ms ease-out" }}
                                >
                                    <span>✅</span>
                                    <span>Photo saved to gallery</span>
                                </div>
                            )}
                        </div>

                        {/* Tombol bawah */}
                        <div className="mt-2 flex w-full justify-between gap-2 text-xs">
                            <button
                                onClick={goBackHome}
                                className="flex-1 rounded-xl border border-slate-200 py-2 text-slate-700 hover:bg-slate-100 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={goGallery}
                                className="flex-1 rounded-xl bg-slate-900 py-2 text-white hover:bg-slate-800 transition"
                            >
                                Go to gallery
                            </button>
                        </div>
                    </div>
                </div>
            </PhoneShell>
        </Layout>
    )
}
