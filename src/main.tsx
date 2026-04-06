import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA (Administrators)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js", { scope: "/admin" })
            .then((registration) => {
                console.log("NOVA PWA ServiceWorker registered for /admin scope:", registration.scope);
            })
            .catch((error) => {
                console.log("NOVA PWA ServiceWorker registration failed:", error);
            });
    });
}
