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
  douyin: 'https://jx.16.do/api/douyin.php',
  xiaohongshu: 'https://jx.16.do/api/xhsjx.php',
  bilibili: 'https://jx.16.do/api/bilibili.php',
  weibo: 'https://jx.16.do/api/weibo.php',
  pipix: 'https://jx.16.do/api/ppxia.php',
  qishui: 'https://jx.16.do/api/qsmusic.php',
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
        result.data!.url = response.data.url;
      } else if (response.data?.images) {
        result.data!.images = response.data.images;
      }
      break;

    case 'xiaohongshu':
      if (response.data?.imgurl) {
        result.data!.imgurl = response.data.imgurl;
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
      }
      break;

    case 'pipix':
    case 'qishui':
      if (response.data?.url) {
        result.data!.url = response.data.url;
      }
      break;
  }

  return result;
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

    const apiUrl = `${PLATFORM_APIS[platform]}?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
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