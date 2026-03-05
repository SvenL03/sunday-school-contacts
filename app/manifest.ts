import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sunday School Contacts",
    short_name: "SS Contacts",
    description: "Import Excel contacts into iPhone",
    start_url: "/",
    display: "standalone",
    background_color: "#eff6ff",
    theme_color: "#2563eb",
    icons: [
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
