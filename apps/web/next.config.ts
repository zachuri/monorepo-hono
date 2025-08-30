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

// Only run setupDevPlatform in development and when ENV is explicitly set
if (process.env.ENV === 'development' && process.env.NODE_ENV !== 'production') {
	(async () => {
		try {
			await setupDevPlatform();
		} catch (error) {
			console.warn('Failed to setup dev platform:', error);
		}
	})();
}

export default withBundleAnalyzer(nextConfig);
