// pages/camera.tsx
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
                setError("Gagal mengakses kamera. Cek permission browser ya 🙏")
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

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL("image/png")
        const photo = {
            id: crypto.randomUUID(),
            dataUrl,
            createdAt: new Date().toISOString(),
        }

        savePhoto(photo)
        setTaking(false)
    }

    const goBack = () => router.push("/")
    const goFinish = () => router.push("/gallery")

    return (
        <Layout>
            <PhoneShell>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goBack}
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
                                    {/* LIVE badge */}
                                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] text-slate-50">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span>LIVE</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Canvas hidden, cuma untuk capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Tombol Take Photo */}
                    <button
                        onClick={handleTakePhoto}
                        disabled={!ready || taking || !!error}
                        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.6)] disabled:bg-emerald-400 disabled:shadow-none hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(16,185,129,0.7)] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                    >
                        <span>{taking ? "Saving..." : "Take Photo"}</span>
                        {!taking && <span>◎</span>}
                    </button>

                    {/* Tombol bawah */}
                    <div className="flex justify-between gap-2 text-sm">
                        <button
                            onClick={goBack}
                            className="flex-1 rounded-xl border border-slate-200 py-2 text-slate-700 hover:bg-slate-100 transition"
                        >
                            Back
                        </button>
                        <button
                            onClick={goFinish}
                            className="flex-1 rounded-xl bg-slate-900 py-2 text-white hover:bg-slate-800 transition"
                        >
                            Finish &amp; Gallery
                        </button>
                    </div>

                    {/* Tips kecil */}
                    <p className="text-[10px] text-center text-slate-500">
                        Tip: pastikan tab ini aktif &amp; izin kamera sudah diizinkan. Foto
                        akan langsung masuk ke gallery kamu.
                    </p>
                </div>
            </PhoneShell>
        </Layout>
    )
}
