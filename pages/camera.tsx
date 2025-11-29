/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { savePhoto } from "../lib/photos"

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

    const router = useRouter()

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
                setError("Gagal mengakses kamera. Cek izin kamera di browser ya 🙏")
            }
        }

        initCamera()

        return () => {
            cancelled = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
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

        // gambar frame dari video dalam posisi MIRROR
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        const width = canvas.width
        const height = canvas.height
        // ... lanjut frame polaroid/clean/film


        const brandTitle = "Smile Photobooth"
        const watermark = "@lentera.photobooth"
        const baseFont =
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

        // ========== FRAME STYLES (pakai versi terakhirmu, cukup biarkan di sini) ==========
        // ... di sini tetap pakai block if (frameStyle === 'polaroid') { ... } else if (...) { ... }
        // (nggak perlu aku ulang supaya jawaban ini nggak kepanjangan)
        // ================================================================================

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

                    {/* Preview kamera */}
                    <div className="rounded-3xl bg-slate-200/80 p-1.5 border border-slate-100 shadow-inner">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-[26px] bg-slate-900">
                            {error ? (
                                <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-200">
                                    {error}
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
