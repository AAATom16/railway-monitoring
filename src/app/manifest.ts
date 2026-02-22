import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Railway Monitoring",
    short_name: "Railway Monitoring",
    description: "Monitor all your Railway services at a glance",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0D0E",
    theme_color: "#0B0D0E",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
