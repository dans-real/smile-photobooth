/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production"

const nextConfig = {
    // Biar bisa di-export ke HTML statis
    output: "export",

    // Kita nggak pakai next/image untuk foto kamera, tapi set aman saja
    images: {
        unoptimized: true,
    },

    // Penting: GitHub Pages project site = /username.github.io/smile-photobooth
    // Jadi basePath & assetPrefix harus ke /smile-photobooth
    basePath: isProd ? "/smile-photobooth" : "",
    assetPrefix: isProd ? "/smile-photobooth/" : "",
}

export default nextConfig
