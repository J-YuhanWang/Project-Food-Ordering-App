/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns:[
      {protocol: 'https', hostname: 'images.unsplash.com'},
      {protocol: 'https', hostname: 'images.pexels.com'},
      {protocol: 'https', hostname: 'ucd-canteen-app-dev.s3.eu-west-1.amazonaws.com' },
    ],
  },
}

export default nextConfig
