# 在线视频解析网站

一个支持多平台视频解析的在线工具，基于Next.js和Vercel构建。

## 支持平台

- 抖音（视频和图集）
- 小红书（图集）
- 哔哩哔哩
- 微博
- 皮皮虾
- 汽水音乐

## 技术栈

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Vercel (部署和环境变量)

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 复制环境变量文件
```bash
cp .env.example .env.local
```

3. 启动开发服务器
```bash
npm run dev
```

## Vercel部署

1. Fork本仓库

2. 在Vercel中导入项目

3. 配置环境变量
   - 在Vercel项目设置中找到「Environment Variables」
   - 添加以下环境变量（可选，默认使用示例API）：
     - `DOUYIN_API`：抖音解析接口
     - `XIAOHONGSHU_API`：小红书解析接口
     - `BILIBILI_API`：哔哩哔哩解析接口
     - `WEIBO_API`：微博解析接口
     - `PPXIA_API`：皮皮虾解析接口
     - `QSMUSIC_API`：汽水音乐解析接口

4. 部署项目

## 注意事项

- 本项目仅供学习和参考
- API接口来源于第三方，不保证其可用性和稳定性
- 建议在生产环境中使用自己的API接口