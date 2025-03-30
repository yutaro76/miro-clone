/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.innerGraph = false; // eslint-disable-line
    }
    return config; // eslint-disable-line
  },
};

export default nextConfig;
