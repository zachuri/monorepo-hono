import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ['@acme/ui'],
	reactStrictMode: true,
	experimental: {
		turbo: {
			rules: {
				'*.svg': {
					loaders: ['@svgr/webpack'],
					as: '*.js',
				},
			},
		},
	},
};

// Move the await into an async function or use top-level await properly
if (process.env.ENV === 'development') {
	// Use an IIFE for top-level await
	(async () => {
		await setupDevPlatform();
	})();
}

export default withBundleAnalyzer(nextConfig);
