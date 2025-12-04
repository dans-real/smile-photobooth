/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { savePhoto, getStorageInfo } from "../lib/photos"
import { useTheme } from "../components/ThemeContext"
import FrameOverlay from "../components/FrameOverlay"
import { type FrameMode, getAllFrameModes, getFrameMode } from "../lib/frameStyles"

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [ready, setReady] = useState(false)
    const [taking, setTaking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [flash, setFlash] = useState(false)
    const [justSaved, setJustSaved] = useState(false)
    const [selectedMode, setSelectedMode] = useState<FrameMode>("polaroid")
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
    const [storageWarning, setStorageWarning] = useState(false)
    const [estimatedPhotosLeft, setEstimatedPhotosLeft] = useState(50)

    const router = useRouter()
    const { theme } = useTheme()
    const isNeon = theme === "neon"

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

        // Create temporary canvas for photo capture (NOT mirrored)
        const photoCanvas = document.createElement("canvas")
        photoCanvas.width = video.videoWidth
        photoCanvas.height = video.videoHeight
        const photoCtx = photoCanvas.getContext("2d")
        if (!photoCtx) {
            setTaking(false)
            return
        }

        // Draw video frame to temp canvas (NOT mirrored - text readable)
        photoCtx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height)

        // Get selected frame mode config
        const frameConfig = getFrameMode(selectedMode)

        // Apply frame using modular config
        frameConfig.canvas.draw(ctx, canvas, photoCanvas, {
            brandTitle: "Smile Photobooth",
            watermark: "@lentera.photobooth",
            baseFont:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        })

        // --- SCALE DOWN untuk hemat storage ---
        let targetCanvas: HTMLCanvasElement = canvas

        // Maksimal sisi 1200px
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

        // JPEG + quality 0.85
        const dataUrl = targetCanvas.toDataURL("image/jpeg", 0.85)

        const photo = {
            id: crypto.randomUUID(),
            dataUrl,
            createdAt: new Date().toISOString(),
        }

        const ok = savePhoto(photo)

        if (!ok) {
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

        // Notif saved
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
                            className={`text-xs rounded-full border px-3 py-1 hover:bg-opacity-10 transition flex items-center gap-1 ${isNeon
                                ? "border-purple-400/60 text-purple-200 hover:bg-purple-500"
                                : "border-purple-200 text-purple-700 hover:bg-purple-100"
                                }`}
                        >
                            ← <span>Home</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFacing}
                                className={`text-[11px] rounded-full border px-2.5 py-1 transition flex items-center gap-1 ${isNeon
                                    ? "border-purple-400/60 text-purple-200 hover:bg-purple-500/10"
                                    : "border-purple-300 text-purple-700 hover:bg-purple-100"
                                    }`}
                            >
                                🔁
                                <span>{facingMode === "user" ? "Front" : "Back"}</span>
                            </button>
                            <div className="text-right">
                                <p className={`text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${isNeon ? "text-purple-400" : "text-purple-500"
                                    }`}>
                                    camera
                                </p>
                                <p className={`text-sm font-semibold transition-colors duration-300 ${isNeon ? "text-fuchsia-100" : "text-purple-900"
                                    }`}>
                                    Capture mode
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Storage warning */}
                    {storageWarning && (
                        <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] transition-colors duration-300 ${isNeon
                            ? "bg-amber-500/20 border-amber-400/70 text-amber-200"
                            : "bg-amber-500/10 border-amber-400/60 text-amber-700"
                            }`}>
                            <span>⚠️</span>
                            <span>Storage hampir penuh! Sisa ~{estimatedPhotosLeft} foto</span>
                        </div>
                    )}

                    {/* Preview kamera */}
                    <div className={`rounded-3xl p-1.5 border shadow-inner transition-colors duration-300 ${isNeon
                        ? "bg-purple-900/40 border-purple-700/60"
                        : "bg-slate-200/80 border-slate-100"
                        }`}>
                        <div className="relative aspect-3/4 overflow-hidden rounded-[26px] bg-slate-900">
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
                                    {/* Video layer - z-0 */}
                                    <video
                                        ref={videoRef}
                                        className="absolute inset-0 h-full w-full object-cover"
                                        style={{ transform: "scaleX(-1)" }}
                                        playsInline
                                        muted
                                    />

                                    {/* LIVE PREVIEW OVERLAY - Frame yang dipilih - z-10 */}
                                    <div className="absolute inset-0 pointer-events-none z-10">
                                        <FrameOverlay mode={selectedMode} isNeon={isNeon} />
                                    </div>

                                    {/* LIVE badge - z-20 */}
                                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-slate-50 z-20">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span>LIVE</span>
                                        <span className="ml-1 opacity-80">
                                            {facingMode === "user" ? "Front" : "Back"}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Flash overlay - z-30 */}
                            {flash && (
                                <div
                                    className="pointer-events-none absolute inset-0 bg-white/80 z-30"
                                    style={{
                                        animation: "camera-flash 220ms ease-out forwards",
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Canvas hidden untuk capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Frame mode selector - 4 modes */}
                    <div className="flex flex-col gap-2">
                        <p
                            className={`text-center text-[10px] font-medium transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                                }`}
                        >
                            Pilih frame style
                        </p>
                        <div className="grid grid-cols-4 gap-2 text-[9px]">
                            {getAllFrameModes().map((mode) => {
                                const active = selectedMode === mode.id
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`rounded-xl px-2 py-2.5 border transition-all duration-300 flex flex-col items-center gap-1 ${active
                                            ? isNeon
                                                ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-100 shadow-lg scale-105"
                                                : "border-pink-400 bg-pink-50 text-pink-700 shadow-lg scale-105"
                                            : isNeon
                                                ? "border-purple-600/60 bg-purple-900/40 text-purple-300 hover:bg-purple-800/40 hover:scale-102"
                                                : "border-purple-200 bg-white/70 text-purple-600 hover:bg-purple-50 hover:scale-102"
                                            }`}
                                    >
                                        <span className="text-lg">{mode.icon}</span>
                                        <span className="font-medium leading-tight">
                                            {mode.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
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
                            <p className={`text-[11px] transition-colors duration-300 ${isNeon ? "text-purple-300" : "text-purple-600"
                                }`}>
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
                                className={`flex-1 rounded-xl border py-2 transition-colors duration-300 ${isNeon
                                    ? "border-purple-600/60 text-purple-200 hover:bg-purple-800/40"
                                    : "border-purple-200 text-purple-700 hover:bg-purple-50"
                                    }`}
                            >
                                Back
                            </button>
                            <button
                                onClick={goGallery}
                                className={`flex-1 rounded-xl py-2 transition-colors duration-300 ${isNeon
                                    ? "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                    }`}
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
