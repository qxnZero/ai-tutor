/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Add this to handle redirects properly
  async redirects() {
    return [
      {
        source: "/api/auth/signin",
        destination: "/auth/signin",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
