import { NextRequest, NextResponse } from 'next/server';

interface ParseResult {
  code: number;
  msg?: string;
  data?: {
    url?: string;
    images?: string[];
    imgurl?: string[];
    quality_urls?: Record<string, string>;
    author?: string;
    title?: string;
    description?: string;
  };
}

const PLATFORM_APIS = {
  douyin: process.env.DOUYIN_API,
  xiaohongshu: process.env.XIAOHONGSHU_API,
  bilibili: process.env.BILIBILI_API,
  weibo: process.env.WEIBO_API,
  pipix: process.env.PIPIX_API,
  qishui: process.env.QISHUI_API,
} as const;

type Platform = keyof typeof PLATFORM_APIS;

const PLATFORM_PATTERNS = {
  douyin: /douyin\.com|iesdouyin\.com/,
  xiaohongshu: /xiaohongshu\.com|xhslink\.com/,
  bilibili: /bilibili\.com/,
  weibo: /weibo\.com/,
  pipix: /pipix\.com|h5\.pipix\.com/,
  qishui: /qishui\.com/,
} as const;

function getPlatform(url: string): Platform | null {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform as Platform;
    }
  }
  return null;
}

async function processApiResponse(platform: Platform, response: any): Promise<ParseResult> {
  if (!response || response.code !== 200) {
    return {
      code: 400,
      msg: '解析失败，请检查链接是否正确',
    };
  }

  const result: ParseResult = {
    code: 200,
    data: {
      author: response.data?.author,
      title: response.data?.title,
      description: response.data?.description,
    },
  };

  switch (platform) {
    case 'douyin':
      if (response.data?.url) {
        // 只确保使用https，保留查询参数
        result.data!.url = response.data.url.replace('http://', 'https://');
      } else if (response.data?.images) {
        // 确保所有图片URL使用https
        result.data!.images = response.data.images.map((img: string) =>
          img.replace('http://', 'https://'));
      }
      break;

    case 'xiaohongshu':
      if (response.data?.imgurl) {
        result.data!.imgurl = response.data.imgurl.map((img: string) =>
          img.replace('http://', 'https://'));
      } else if (response.data?.url) {
        result.data!.url = response.data.url.replace('http://', 'https://');
      }
      break;

    case 'bilibili':
      if (response.data?.url) {
        result.data!.url = response.data.url;
      }
      break;

    case 'weibo':
      if (response.data?.quality_urls) {
        result.data!.quality_urls = response.data.quality_urls;
      } else if (response.data?.url) {
        result.data!.url = response.data.url;
      }
      break;

    case 'pipix':
    case 'qishui':
      if (response.data?.url) {
        // 只确保使用https，保留查询参数
        result.data!.url = response.data.url.replace('http://', 'https://');
      }
      break;
  }

  return result; // 直接返回结果，移除媒体URL验证
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ code: 400, msg: '请输入链接' });
    }

    const platform = getPlatform(url);
    if (!platform) {
      return NextResponse.json({ code: 400, msg: '不支持的平台或链接格式不正确' });
    }

    const apiUrl = PLATFORM_APIS[platform];
    if (!apiUrl) {
      return NextResponse.json({ code: 500, msg: '接口配置错误' });
    }

    const response = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    const result = await processApiResponse(platform, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ code: 500, msg: '服务器错误' });
  }
}

export async function GET() {
  return NextResponse.json({ code: 405, msg: 'Method not allowed' });
}