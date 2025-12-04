// lib/frameStyles.ts - Configuration untuk 4 mode frame

export type FrameMode = "polaroid" | "minimal" | "film" | "neon-story"

export interface FrameModeConfig {
    id: FrameMode
    label: string
    icon: string
    description: string
    preview: {
        // Component overlay akan di-render di camera.tsx
        // Classes untuk styling preview overlay
        containerClass: string
        topBarClass?: string
        bottomBarClass?: string
        borderClass?: string
        // Custom render function untuk elemen kompleks
        renderOverlay?: (isNeon: boolean) => React.ReactNode
    }
    canvas: {
        // Function untuk draw frame di canvas setelah take photo
        draw: (
            ctx: CanvasRenderingContext2D,
            canvas: HTMLCanvasElement,
            photoCanvas: HTMLCanvasElement,
            options: {
                brandTitle: string
                watermark: string
                baseFont: string
            }
        ) => void
    }
}

const brandTitle = "Smile Photobooth"
const watermark = "@lentera.photobooth"
const baseFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

/**
 * Helper: Draw image in "cover" mode (fills container, crops overflow)
 * Reserved for future use in complex frame layouts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawCover(
    img: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
) {
    const imgRatio = img.width / img.height
    const targetRatio = w / h

    let drawW = w
    let drawH = h
    let offsetX = 0
    let offsetY = 0

    if (imgRatio > targetRatio) {
        drawH = h
        drawW = h * imgRatio
        offsetX = (w - drawW) / 2
    } else {
        drawW = w
        drawH = w / imgRatio
        offsetY = (h - drawH) / 2
    }

    ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH)
}

export const FRAME_MODES: Record<FrameMode, FrameModeConfig> = {
    polaroid: {
        id: "polaroid",
        label: "Polaroid",
        icon: "📷",
        description: "Instant camera vibe",
        preview: {
            containerClass: "absolute inset-0 pointer-events-none",
            borderClass: "absolute inset-3 border-[6px] border-white rounded-xl shadow-2xl pointer-events-none",
            bottomBarClass:
                "absolute bottom-3 left-3 right-3 h-16 bg-white rounded-b-xl flex flex-col items-center justify-center gap-0.5 pointer-events-none",
        },
        canvas: {
            draw: (ctx, canvas, photoCanvas) => {
                const width = photoCanvas.width
                const height = photoCanvas.height

                const borderBottom = height * 0.12
                const borderSide = width * 0.08
                const borderTop = width * 0.08

                canvas.width = width + borderSide * 2
                canvas.height = height + borderTop + borderBottom

                // White background
                ctx.fillStyle = "#ffffff"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw photo
                ctx.drawImage(photoCanvas, borderSide, borderTop)

                // Shadow
                ctx.shadowColor = "rgba(0,0,0,0.1)"
                ctx.shadowBlur = 20
                ctx.shadowOffsetY = 10

                // Bottom label
                const labelY = height + borderTop + borderBottom / 2
                ctx.fillStyle = "#1e293b"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = `600 ${width * 0.045}px ${baseFont}`
                ctx.fillText(brandTitle, canvas.width / 2, labelY - borderBottom * 0.15)

                // Watermark
                ctx.fillStyle = "#64748b"
                ctx.font = `500 ${width * 0.028}px ${baseFont}`
                ctx.fillText(watermark, canvas.width / 2, labelY + borderBottom * 0.12)
            },
        },
    },

    minimal: {
        id: "minimal",
        label: "Minimal",
        icon: "✨",
        description: "Clean & elegant",
        preview: {
            containerClass: "absolute inset-0 pointer-events-none",
            borderClass: "absolute inset-4 border-[3px] border-white/90 rounded-2xl shadow-xl pointer-events-none",
            bottomBarClass:
                "absolute bottom-4 left-4 right-4 h-10 bg-gradient-to-t from-white/95 to-white/40 backdrop-blur-sm rounded-b-2xl flex items-center justify-between px-2 pointer-events-none",
        },
        canvas: {
            draw: (ctx, canvas, photoCanvas) => {
                const width = photoCanvas.width
                const height = photoCanvas.height
                const border = width * 0.04

                canvas.width = width + border * 2
                canvas.height = height + border * 3

                // Soft background
                ctx.fillStyle = "#fafafa"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Photo with shadow
                ctx.shadowColor = "rgba(0,0,0,0.08)"
                ctx.shadowBlur = 15
                ctx.drawImage(photoCanvas, border, border)

                // Reset shadow
                ctx.shadowColor = "transparent"
                ctx.shadowBlur = 0

                // Bottom watermark
                const labelY = height + border * 2.2
                ctx.fillStyle = "#94a3b8"
                ctx.textAlign = "right"
                ctx.textBaseline = "middle"
                ctx.font = `500 ${width * 0.025}px ${baseFont}`
                ctx.fillText(watermark, canvas.width - border * 1.5, labelY)

                // Brand on left
                ctx.textAlign = "left"
                ctx.fillStyle = "#cbd5e1"
                ctx.fillText(brandTitle, border * 1.5, labelY)
            },
        },
    },

    film: {
        id: "film",
        label: "Film",
        icon: "🎞️",
        description: "Cinematic letterbox",
        preview: {
            containerClass: "absolute inset-0 pointer-events-none",
            topBarClass: "absolute top-0 left-0 right-0 h-7 bg-slate-900/95 pointer-events-none",
            bottomBarClass: "absolute bottom-0 left-0 right-0 h-9 bg-slate-900/95 flex items-center justify-end pr-3 pointer-events-none",
        },
        canvas: {
            draw: (ctx, canvas, photoCanvas) => {
                const width = photoCanvas.width
                const height = photoCanvas.height
                const stripW = width * 0.08
                const borderTop = width * 0.06
                const borderBottom = width * 0.08

                canvas.width = width + stripW * 2
                canvas.height = height + borderTop + borderBottom

                // Black background
                ctx.fillStyle = "#0f172a"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw photo
                ctx.drawImage(photoCanvas, stripW, borderTop)

                // Film holes
                const holeSize = stripW * 0.4
                const holeGap = height / 8
                ctx.fillStyle = "#1e293b"
                for (let i = 0; i < 7; i++) {
                    const y = borderTop + i * holeGap + holeGap / 2
                    // Left holes
                    ctx.fillRect(stripW * 0.3, y - holeSize / 2, holeSize, holeSize)
                    // Right holes
                    ctx.fillRect(
                        canvas.width - stripW * 0.3 - holeSize,
                        y - holeSize / 2,
                        holeSize,
                        holeSize
                    )
                }

                // Top label
                ctx.fillStyle = "#f1f5f9"
                ctx.textAlign = "left"
                ctx.textBaseline = "middle"
                ctx.font = `600 ${width * 0.035}px ${baseFont}`
                ctx.fillText(brandTitle, stripW * 2, borderTop / 2)

                // Bottom watermark
                ctx.fillStyle = "#94a3b8"
                ctx.textAlign = "right"
                ctx.font = `500 ${width * 0.028}px ${baseFont}`
                ctx.fillText(
                    watermark,
                    canvas.width - stripW * 2,
                    height + borderTop + borderBottom / 2
                )
            },
        },
    },

    "neon-story": {
        id: "neon-story",
        label: "Neon Story",
        icon: "🌌",
        description: "Vibrant club vibes",
        preview: {
            containerClass: "absolute inset-0 pointer-events-none",
            borderClass:
                "absolute inset-3 rounded-3xl border-[3px] bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(236,72,153,0.6)] pointer-events-none",
            topBarClass:
                "absolute top-3 left-3 right-3 h-12 bg-gradient-to-b from-slate-900/95 to-transparent rounded-t-3xl pointer-events-none",
            bottomBarClass:
                "absolute bottom-3 left-3 right-3 h-14 bg-gradient-to-t from-slate-900/95 to-transparent rounded-b-3xl flex items-end justify-center pb-2 pointer-events-none",
        },
        canvas: {
            draw: (ctx, canvas, photoCanvas) => {
                const width = photoCanvas.width
                const height = photoCanvas.height
                const border = width * 0.06
                const barTop = width * 0.08
                const barBottom = width * 0.09

                canvas.width = width + border * 2
                canvas.height = height + border * 2 + barTop + barBottom

                // Dark background
                ctx.fillStyle = "#0a0118"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Neon glow border
                ctx.save()
                ctx.shadowColor = "#ec4899"
                ctx.shadowBlur = 25
                ctx.strokeStyle = "#ec4899"
                ctx.lineWidth = border / 2
                ctx.strokeRect(
                    border / 2,
                    border / 2,
                    canvas.width - border,
                    canvas.height - border
                )
                ctx.restore()

                // Draw photo
                ctx.drawImage(photoCanvas, border, border + barTop)

                // Top bar gradient
                const gradTop = ctx.createLinearGradient(0, 0, 0, barTop + border)
                gradTop.addColorStop(0, "rgba(15,23,42,0.98)")
                gradTop.addColorStop(1, "rgba(15,23,42,0)")
                ctx.fillStyle = gradTop
                ctx.fillRect(border, border, canvas.width - border * 2, barTop)

                // Bottom bar gradient
                const gradBottom = ctx.createLinearGradient(
                    0,
                    height + border + barTop,
                    0,
                    canvas.height
                )
                gradBottom.addColorStop(0, "rgba(15,23,42,0)")
                gradBottom.addColorStop(0.5, "rgba(15,23,42,0.85)")
                gradBottom.addColorStop(1, "rgba(15,23,42,0.98)")
                ctx.fillStyle = gradBottom
                ctx.fillRect(
                    border,
                    height + border + barTop,
                    canvas.width - border * 2,
                    barBottom + border
                )

                // Brand title (neon glow)
                const labelY = height + border + barTop + barBottom / 2
                ctx.save()
                ctx.shadowColor = "#a855f7"
                ctx.shadowBlur = 15
                ctx.fillStyle = "#e9d5ff"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = `700 ${width * 0.042}px ${baseFont}`
                ctx.fillText(brandTitle, canvas.width / 2, labelY)
                ctx.restore()

                // Watermark
                ctx.fillStyle = "#94a3b8"
                ctx.textAlign = "right"
                ctx.font = `500 ${width * 0.026}px ${baseFont}`
                ctx.fillText(watermark, canvas.width - border * 2, labelY + barBottom * 0.22)
            },
        },
    },
}

export function getFrameMode(id: FrameMode): FrameModeConfig {
    return FRAME_MODES[id]
}

export function getAllFrameModes(): FrameModeConfig[] {
    return Object.values(FRAME_MODES)
}
