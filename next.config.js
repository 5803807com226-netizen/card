/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
      },
      {
        protocol: 'https',
        hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'asia.limitlessmtg.com',
      },
      {
        protocol: 'https',
        hostname: '*.tcgdex.net',
      },
      {
        protocol: 'https',
        hostname: 'static.bandainamco-am.co.jp',
      },
      {
        protocol: 'https',
        hostname: '*.ebayimg.com',
      },
    ],
  },
};

module.exports = nextConfig;
