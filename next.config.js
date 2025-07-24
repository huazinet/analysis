/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许跨域请求
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // 添加图片和视频域名配置
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.douyin.com' },
      { protocol: 'https', hostname: '*.douyinvod.com' },
      { protocol: 'https', hostname: '*.douyinpic.com' },
      { protocol: 'https', hostname: '*.xiaohongshu.com' },
      { protocol: 'https', hostname: '*.bilibili.com' },
      { protocol: 'https', hostname: '*.weibo.com' },
      { protocol: 'https', hostname: '*.pipix.com' },
      { protocol: 'https', hostname: '*.qishui.com' },
    ],
  },
  // 添加SWC配置
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;