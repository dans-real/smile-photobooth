// lib/photos.ts
export type Photo = {
    id: string
    dataUrl: string
    createdAt: string
}

const STORAGE_KEY = "smile-photobooth-photos"

export function loadPhotos(): Photo[] {
    if (typeof window === "undefined") return []
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as Photo[]
    } catch {
        return []
    }
}

export function savePhoto(photo: Photo) {
    if (typeof window === "undefined") return
    const photos = loadPhotos()
    const next = [photo, ...photos]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearPhotos() {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(STORAGE_KEY)
}
