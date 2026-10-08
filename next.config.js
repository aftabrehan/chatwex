/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      'github.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
    ].map((hostname) => ({ protocol: 'https', hostname })),
  },
}
