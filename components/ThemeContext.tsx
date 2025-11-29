// components/ThemeContext.tsx
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"

type Theme = "sky" | "neon"

type ThemeContextType = {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("sky")

    // Load dari localStorage
    useEffect(() => {
        if (typeof window === "undefined") return
        const stored = window.localStorage.getItem("spb-theme")
        if (stored === "sky" || stored === "neon") {
            setTheme(stored)
        }
    }, [])

    // Simpan ke localStorage
    useEffect(() => {
        if (typeof window === "undefined") return
        window.localStorage.setItem("spb-theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => (prev === "sky" ? "neon" : "sky"))
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider")
    }
    return ctx
}
