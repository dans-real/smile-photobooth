// components/FrameOverlay.tsx - Live preview overlay untuk frame modes

import { type FrameMode, FRAME_MODES } from "../lib/frameStyles"

interface FrameOverlayProps {
    mode: FrameMode
    isNeon: boolean
}

export default function FrameOverlay({ mode, isNeon }: FrameOverlayProps) {
    const config = FRAME_MODES[mode]

    // Custom render function jika ada
    if (config.preview.renderOverlay) {
        return <>{config.preview.renderOverlay(isNeon)}</>
    }

    // Default render berdasarkan classes
    return (
        <div className={config.preview.containerClass}>
            {/* Top bar (hanya untuk Film dan Neon Story) */}
            {config.preview.topBarClass && (
                <div className={config.preview.topBarClass}>
                    {mode === "film" && (
                        // Film holes di top bar
                        <div className="absolute left-2 top-0 bottom-0 w-6 flex flex-row justify-around items-center px-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-slate-700 rounded-sm"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom bar */}
            {config.preview.bottomBarClass && (
                <div className={config.preview.bottomBarClass}>
                    {mode === "polaroid" && (
                        <>
                            <p className="text-slate-800 font-semibold text-[10px] tracking-tight">
                                Smile Photobooth
                            </p>
                            <p className="text-slate-500 text-[7px]">
                                @lentera.photobooth
                            </p>
                        </>
                    )}

                    {mode === "minimal" && (
                        <>
                            <p className="text-slate-400 text-[7px] font-medium">
                                Smile Photobooth
                            </p>
                            <p className="text-slate-400 text-[6px]">
                                @lentera.photobooth
                            </p>
                        </>
                    )}

                    {mode === "film" && (
                        <>
                            <p className="text-slate-300 text-[8px] font-medium">
                                @lentera.photobooth
                            </p>
                        </>
                    )}

                    {mode === "neon-story" && (
                        <div className="flex flex-col items-center gap-0.5">
                            <p
                                className="font-bold text-[9px] tracking-wide"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #e9d5ff 0%, #fbbf24 50%, #06b6d4 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    filter: "drop-shadow(0 0 8px rgba(168,85,247,0.6))",
                                }}
                            >
                                Smile Photobooth
                            </p>
                            <p className="text-slate-400 text-[6px]">
                                @lentera.photobooth
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Film side strips dengan holes */}
            {mode === "film" && (
                <>
                    {/* Left strip */}
                    <div className="absolute left-0 top-7 bottom-9 w-5 bg-slate-900/95 flex flex-col justify-around items-center py-3 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-slate-700 rounded-sm" />
                        ))}
                    </div>
                    {/* Right strip */}
                    <div className="absolute right-0 top-7 bottom-9 w-5 bg-slate-900/95 flex flex-col justify-around items-center py-3 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-slate-700 rounded-sm" />
                        ))}
                    </div>
                </>
            )}

            {/* Polaroid border - outline only */}
            {mode === "polaroid" && (
                <>
                    {/* White border frame */}
                    <div className="absolute inset-3 border-[6px] border-white rounded-xl shadow-2xl pointer-events-none" />
                </>
            )}

            {/* Minimal border - thin outline */}
            {mode === "minimal" && (
                <>
                    {/* Thin white border */}
                    <div className="absolute inset-4 border-[3px] border-white/90 rounded-2xl shadow-xl pointer-events-none" />
                </>
            )}

            {/* Neon Story - gradient outline border penuh sampai bawah termasuk teks */}
            {mode === "neon-story" && (
                <>
                    {/* Gradient border outline - extends dari top sampai bottom bar */}
                    <div className="absolute top-3 left-3 right-3 bottom-3 pointer-events-none">
                        <div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)',
                                padding: '3px',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                            }}
                        />
                        <div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                                boxShadow: '0 0 30px rgba(236, 72, 153, 0.6), inset 0 0 30px rgba(168, 85, 247, 0.3)',
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
