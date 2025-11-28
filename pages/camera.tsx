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
                setError("Gagal mengakses kamera. Cek permission browser ya.")
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
        if (!ctx) return

        // set ukuran canvas sama dengan video
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
                    <h1 className="text-center text-lg font-semibold text-slate-800">
                        Camera
                    </h1>

                    <div className="rounded-2xl overflow-hidden bg-slate-200 aspect-[3/4] flex items-center justify-center">
                        {error && (
                            <p className="text-xs text-red-600 px-3 text-center">{error}</p>
                        )}
                        {!error && (
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />
                        )}
                    </div>

                    {/* Canvas hidden, cuma buat capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    <button
                        onClick={handleTakePhoto}
                        disabled={!ready || taking}
                        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:bg-emerald-400 transition"
                    >
                        {taking ? "Saving..." : "Take Photo"}
                    </button>

                    <div className="flex justify-between gap-2 text-sm">
                        <button
                            onClick={goBack}
                            className="flex-1 rounded-lg border border-emerald-600 py-2 text-emerald-700 hover:bg-emerald-50 transition"
                        >
                            Back
                        </button>
                        <button
                            onClick={goFinish}
                            className="flex-1 rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700 transition"
                        >
                            Finish
                        </button>
                    </div>

                    <p className="text-[11px] text-center text-slate-500">
                        Foto yang kamu ambil cuma disimpan di browser ini (localStorage).
                    </p>
                </div>
            </PhoneShell>
        </Layout>
    )
}
