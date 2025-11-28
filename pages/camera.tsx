/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import PhoneShell from "../components/PhoneShell"
import { savePhoto } from "../lib/photos"

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [ready, setReady] = useState(false)
    const [taking, setTaking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [flash, setFlash] = useState(false)
    const [justSaved, setJustSaved] = useState(false)
    const router = useRouter()

    useEffect(() => {
        let stream: MediaStream

        async function initCamera() {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Browser kamu belum support kamera.")
                return
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false,
                })
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
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

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

        // Sesuaikan ukuran canvas dengan video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Gambar frame utama dari video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // ====== FRAME PHOTOBOOT OVERLAY ======

        // Border putih di sekeliling foto
        const border = Math.max(10, Math.round(canvas.width * 0.04))
        ctx.lineWidth = border
        ctx.strokeStyle = "rgba(255,255,255,0.96)"
        ctx.strokeRect(
            border / 2,
            border / 2,
            canvas.width - border,
            canvas.height - border
        )

        // Panel putih di bagian bawah (seperti polaroid)
        const panelHeight = Math.round(canvas.height * 0.16)
        const panelPadding = Math.round(canvas.width * 0.04)
        ctx.fillStyle = "rgba(255,255,255,0.94)"
        ctx.fillRect(
            panelPadding,
            canvas.height - panelHeight - panelPadding,
            canvas.width - panelPadding * 2,
            panelHeight
        )

        // Teks judul di panel bawah
        ctx.fillStyle = "#0f172a"
        const fontSize = Math.round(canvas.height * 0.045)
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(
            "Smile Photobooth",
            canvas.width / 2,
            canvas.height - panelPadding - panelHeight / 2
        )

        // ====== END FRAME ======

        const dataUrl = canvas.toDataURL("image/png")
        const photo = {
            id: crypto.randomUUID(),
            dataUrl,
            createdAt: new Date().toISOString(),
        }

        savePhoto(photo)

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
                        <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                camera
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                                Capture mode
                            </p>
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
                                        playsInline
                                        muted
                                    />
                                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-slate-50">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span>LIVE</span>
                                    </div>
                                </>
                            )}

                            {/* Flash overlay */}
                            {flash && (
                                <div
                                    className="pointer-events-none absolute inset-0 bg-white/80"
                                    style={{ animation: "camera-flash 220ms ease-out forwards" }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Canvas hidden untuk capture */}
                    <canvas ref={canvasRef} className="hidden" />

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
