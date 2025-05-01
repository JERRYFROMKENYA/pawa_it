import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        remotePatterns: [new URL('https://openweathermap.org/img/**')],
    }
};

export default nextConfig;
