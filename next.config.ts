import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
  },
  /* config options here */
  reactStrictMode: true,
};

export default nextConfig;
