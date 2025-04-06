const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['v5.airtableusercontent.com'],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

export default nextConfig;
