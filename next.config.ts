/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // Add Google profile image domain
    remotePatterns: [
      // Production images
      {
        protocol: "https",
        hostname: "exceptionhandling-production.up.railway.app",
        pathname: "/uploads/**",
      },
      // Development images
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080", // Ensure this matches your backend port
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
