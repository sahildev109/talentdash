import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        hostname: 'pub-*.r2.dev',
      },
    ],
  },
};

let config = nextConfig;

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
  config = withBundleAnalyzer(config);
}

export default config;
