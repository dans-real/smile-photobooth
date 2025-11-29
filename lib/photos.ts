// lib/photos.ts
const STORAGE_KEY = "smile-photobooth-photos"

export type Photo = {
    id: string
    dataUrl: string
    createdAt: string
}

export function loadPhotos(): Photo[] {
    if (typeof window === "undefined") return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as Photo[]
        if (!Array.isArray(parsed)) return []
        return parsed
    } catch (err) {
        console.error("Failed to load photos from localStorage", err)
        return []
    }
}

/**
 * Simpan foto ke localStorage.
 * Return true kalau sukses, false kalau gagal (misalnya quota penuh).
 */
export function savePhoto(photo: Photo): boolean {
    if (typeof window === "undefined") return false
    try {
        const photos = loadPhotos()
        const next = [photo, ...photos]
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return true
    } catch (err) {
        console.error("Failed to save photo", err)
        // Biasanya QuotaExceededError kalau sudah penuh
        return false
    }
}

export function clearPhotos() {
    if (typeof window === "undefined") return
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
        console.error("Failed to clear photos", err)
    }
}
