module.exports = {
  swcMinify: true,
  async headers() {
    return [
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/list',
        permanent: false
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/utils/:path*",
        destination: `https://szpf8kygnk.execute-api.ap-southeast-1.amazonaws.com/prod/:path*`,
      },
    ];
  },
}