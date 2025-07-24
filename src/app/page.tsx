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

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError('下载失败，请稍后重试');
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
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const ext = url.includes('.mp4') ? '.mp4' : '.jpg';
      await downloadFile(url, `media-${i + 1}${ext}`);
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.images || data.imgurl || []).map((img: string, index: number) => (
              <div key={index} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img
                  src={img}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-64 object-cover cursor-zoom-in transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(img)}
                  crossOrigin="anonymous"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      downloadFile(img, `image-${index + 1}.jpg`);
                    }}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    下载
                  </button>
                </div>
              </div>
            ))}
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">在线视频解析</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="请输入视频链接（支持自动识别平台）"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <button
            onClick={handleParse}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
          >
            {loading ? '解析中...' : '开始解析'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {result?.data && (
          <div className="space-y-6">
            {/* 媒体信息卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              {result.data.author && (
                <p className="text-gray-800">
                  <span className="font-medium">作者：</span>
                  {result.data.author}
                </p>
              )}
              {result.data.title && (
                <p className="text-gray-800">
                  <span className="font-medium">标题：</span>
                  {result.data.title}
                </p>
              )}
              {result.data.description && (
                <p className="text-gray-800">
                  <span className="font-medium">描述：</span>
                  {result.data.description}
                </p>
              )}
            </div>

            {/* 视频播放器 */}
            {(result.data.url || result.data.quality_urls) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <video
                  key={result.data.url || Object.values(result.data.quality_urls || {})[0]} // 添加key以强制重新加载
                  src={result.data.url || Object.values(result.data.quality_urls || {})[0]}
                  controls
                  className="w-full rounded-lg"
                  crossOrigin="anonymous"
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    if (target.error) {
                      setError(`视频加载失败：${target.error.message}`);
                    }
                  }}
                />
              </div>
            )}

            {/* 图集展示 */}
            {(result.data.images || result.data.imgurl) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(result.data.images || result.data.imgurl || []).map((img: string, index: number) => (
                  <div key={index} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <img
                      src={img}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-64 object-cover cursor-zoom-in transition-transform hover:scale-105"
                      onClick={() => setSelectedImage(img)}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a
                        href={img}
                        download={`image-${index + 1}.jpg`}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        下载
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 批量下载按钮 */}
            {(result.data.url || result.data.images || result.data.imgurl || result.data.quality_urls) && (
              <div className="text-center">
                <button
                  onClick={downloadAllMedia}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                >
                  下载所有素材
                </button>
              </div>
            )}
          </div>
        )}

        {/* 图片预览模态框 */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="预览图片"
                className="max-w-full max-h-full object-contain rounded-lg"
                crossOrigin="anonymous"
              />
              <button
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full text-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-500 border-t border-gray-100 pt-8">
          <p>支持平台：抖音、小红书、哔哩哔哩、微博、皮皮虾、汽水音乐</p>
        </div>
      </div>
    </main>
  );
}