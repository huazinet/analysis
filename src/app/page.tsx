'use client';

import React, { useState } from 'react';

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

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleParse = async () => {
    if (!url) {
      setError('请输入链接');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json() as ParseResult;
      if (data.code === 200) {
        setResult(data);
      } else {
        setError(data.msg || '解析失败');
      }
    } catch (err) {
      setError('解析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllMedia = async () => {
    if (!result?.data) return;

    const { data } = result;
    const urls: string[] = [];

    // 收集所有需要下载的URL
    if (data.url) {
      urls.push(data.url);
    } else if (data.images) {
      urls.push(...data.images);
    } else if (data.imgurl) {
      urls.push(...data.imgurl);
    } else if (data.quality_urls) {
      urls.push(Object.values(data.quality_urls)[0]);
    }

    // 下载所有文件
    urls.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-${index + 1}${url.includes('.mp4') ? '.mp4' : '.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const renderMediaInfo = () => {
    if (!result?.data) return null;
    const { data } = result;

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        {data.author && (
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">作者：</span>
            {data.author}
          </p>
        )}
        {data.title && (
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">标题：</span>
            {data.title}
          </p>
        )}
        {data.description && (
          <p className="text-gray-700">
            <span className="font-semibold">描述：</span>
            {data.description}
          </p>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.code !== 200) {
      return <div className="text-red-500 mt-4">{result.msg || '解析失败'}</div>;
    }

    const { data } = result;
    if (!data) return null;

    return (
      <div className="mt-4">
        {renderMediaInfo()}
        
        {/* 视频展示 */}
        {(data.url || data.quality_urls) && (
          <div className="mt-4">
            <video
              src={data.url || Object.values(data.quality_urls || {})[0]}
              controls
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* 图集展示 */}
        {(data.images || data.imgurl) && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.images || data.imgurl || []).map((img: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`图片 ${index + 1}`}
                    className="w-full rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedImage(img)}
                  />
                  <a
                    href={img}
                    download={`image-${index + 1}.jpg`}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <span className="text-white">下载</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 批量下载按钮 */}
        {(data.url || data.images || data.imgurl || data.quality_urls) && (
          <button
            onClick={downloadAllMedia}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            下载所有素材
          </button>
        )}

        {/* 图片预览模态框 */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <img
                src={selectedImage}
                alt="预览图片"
                className="max-w-full max-h-full object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white text-xl"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">在线视频解析</h1>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="请输入视频链接（支持自动识别平台）"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleParse}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '解析中...' : '开始解析'}
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {renderResult()}

        <div className="mt-8 text-center text-gray-500">
          <p>支持平台：抖音、小红书、哔哩哔哩、微博、皮皮虾、汽水音乐</p>
        </div>
      </div>
    </main>
  );
}