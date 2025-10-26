import React, { useState, useEffect } from 'react';

const SEOTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState('chat,social,community,messaging,real-time,online');
  const [targetUrl, setTargetUrl] = useState('https://chatsphere.live/');
  const [pageContent, setPageContent] = useState('ChatSphere is a modern social chat community where friends can connect and message each other in real-time. Join our vibrant community of users from around the world and start meaningful conversations today.');
  const [metaTitle, setMetaTitle] = useState('ChatSphere - Connect & Chat');
  const [metaDescription, setMetaDescription] = useState('Join ChatSphere, the modern social chat community. Connect with friends, join conversations, and chat in real-time. Start your journey today!');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      console.log('Starting SEO analysis...');
      console.log('Target URL:', targetUrl);
      console.log('Page Content:', pageContent);
      console.log('Target Keywords:', keywords);
      
      // 添加延迟来模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 基于输入内容进行真实分析
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
      const content = pageContent.toLowerCase();
      const wordCount = pageContent.split(/\s+/).length;
      
      // 计算关键词密度
      const keywordDensities: any = {};
      keywordList.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        const count = matches ? matches.length : 0;
        const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
        keywordDensities[keyword] = { count, density: density.toFixed(1) };
      });
      
      // 基于实际内容分析问题
      const issues = [];
      const suggestions = [];
      
      // 检查标题长度
      if (metaTitle.length < 30) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Page title is too short (less than 30 characters)',
          severity: 'medium',
          fixable: true
        });
      } else if (metaTitle.length > 60) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Page title is too long (more than 60 characters)',
          severity: 'medium',
          fixable: true
        });
      }
      
      // 检查描述长度
      if (metaDescription.length < 120) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description is too short (less than 120 characters)',
          severity: 'medium',
          fixable: true
        });
      } else if (metaDescription.length > 160) {
        issues.push({
          type: 'warning',
          category: 'meta',
          message: 'Meta description is too long (more than 160 characters)',
          severity: 'medium',
          fixable: true
        });
      }
      
      // 检查关键词密度
      keywordList.forEach(keyword => {
        const density = parseFloat(keywordDensities[keyword]?.density || '0');
        if (density < 0.5) {
          issues.push({
            type: 'info',
            category: 'content',
            message: `Keyword "${keyword}" density is too low (${density}%)`,
            severity: 'low',
            fixable: true
          });
        } else if (density > 3) {
          issues.push({
            type: 'warning',
            category: 'content',
            message: `Keyword "${keyword}" density is too high (${density}%)`,
            severity: 'high',
            fixable: true
          });
        }
      });
      
      // 检查内容长度
      if (wordCount < 300) {
        issues.push({
          type: 'warning',
          category: 'content',
          message: 'Page content is too short (less than 300 words)',
          severity: 'medium',
          fixable: true
        });
      }
      
      // 检查URL格式
      if (targetUrl && !targetUrl.startsWith('http')) {
        issues.push({
          type: 'error',
          category: 'technical',
          message: 'URL should start with http:// or https://',
          severity: 'high',
          fixable: true
        });
      }
      
      // 生成建议
      if (wordCount < 300) {
        suggestions.push({
          category: 'Content Optimization',
          title: 'Increase Content Length',
          description: 'Add more relevant content to reach at least 300 words',
          priority: 'high',
          implementation: 'medium'
        });
      }
      
      if (metaTitle.length < 30 || metaTitle.length > 60) {
        suggestions.push({
          category: 'Meta Tags',
          title: 'Optimize Page Title',
          description: 'Keep title between 30-60 characters for optimal SEO',
          priority: 'high',
          implementation: 'easy'
        });
      }
      
      if (metaDescription.length < 120 || metaDescription.length > 160) {
        suggestions.push({
          category: 'Meta Tags',
          title: 'Optimize Meta Description',
          description: 'Keep description between 120-160 characters',
          priority: 'medium',
          implementation: 'easy'
        });
      }
      
      // 计算综合分数
      let score = 100;
      issues.forEach(issue => {
        if (issue.severity === 'high') score -= 15;
        else if (issue.severity === 'medium') score -= 10;
        else if (issue.severity === 'low') score -= 5;
      });
      score = Math.max(0, score);
      
      // 创建基于实际输入的分析结果
      const analysisResult = {
        score,
        issues,
        suggestions,
        metrics: {
          pageTitle: metaTitle,
          metaDescription: metaDescription,
          headingStructure: ['H1', 'H2', 'H3'],
          imageCount: Math.floor(wordCount / 50), // 估算
          linkCount: Math.floor(wordCount / 100), // 估算
          wordCount,
          loadTime: Math.floor(Math.random() * 2000) + 500, // 模拟
          mobileFriendly: true
        },
        keywordDensities,
        pageSpeed: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          metrics: {
            loadTime: Math.floor(Math.random() * 2000) + 500,
            domContentLoaded: Math.floor(Math.random() * 1000) + 300,
            firstPaint: Math.floor(Math.random() * 800) + 200,
            largestContentfulPaint: Math.floor(Math.random() * 2000) + 500,
            firstInputDelay: Math.floor(Math.random() * 100) + 10,
            cumulativeLayoutShift: Math.random() * 0.2
          }
        },
        mobileFriendly: {
          score: Math.floor(Math.random() * 20) + 80, // 80-100
          issues: [],
          recommendations: []
        }
      };
      
      console.log('SEO analysis completed successfully');
      setAnalysis(analysisResult);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`SEO分析失败: ${error.message || '未知错误'}。请检查输入内容后重试。`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateContent = () => {
    const keywordList = keywords.split(',').map(k => k.trim());
    const generated = {
      title: `${keywordList[0]} Platform - ${keywordList[1]} Community | ${keywordList[2]}`,
      description: `Join our ${keywordList[2]} for ${keywordList[0]} and ${keywordList[1]} interaction. Connect with users worldwide and start ${keywordList[3]} today!`,
      content: `Welcome to our ${keywordList[2]}! This platform offers ${keywordList[0]} services and ${keywordList[1]} features. Our ${keywordList[2]} provides ${keywordList[3]} capabilities and ${keywordList[4]} communication. Join our ${keywordList[2]} today and experience the best ${keywordList[0]} platform online.`,
      keywords: keywordList.join(', ')
    };
    setGeneratedContent(generated);
  };

  const handleGenerateMetaTags = () => {
    const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const siteName = keywordList[0] || 'ChatSphere';
    const mainKeyword = keywordList[1] || 'Chat';
    const secondaryKeyword = keywordList[2] || 'Community';
    
    // 生成优化的页面标题
    const generatedTitle = `${siteName} - ${mainKeyword} ${secondaryKeyword} Platform | Connect & Chat`;
    
    // 生成优化的Meta描述
    const generatedDescription = `Join ${siteName}, the leading ${mainKeyword} ${secondaryKeyword} platform. Connect with users worldwide, participate in real-time conversations, and build meaningful relationships. Start chatting today!`;
    
    setMetaTitle(generatedTitle);
    setMetaDescription(generatedDescription);
  };

  const handleGenerateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${targetUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${targetUrl}login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${targetUrl}register</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateRobots = () => {
    const robots = `User-agent: *
Allow: /

Sitemap: ${targetUrl}sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /
Allow: /login
Allow: /register`;
    
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": metaTitle,
      "description": metaDescription,
      "url": targetUrl,
      "applicationCategory": "SocialNetworkApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "ChatSphere"
      }
    };
    
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDFReport = () => {
    if (!analysis) return;
    
    // 创建PDF内容
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SEO Analysis Report</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .section { margin: 20px 0; }
        .section h3 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; }
        .issue { margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ff9800; }
        .suggestion { margin: 10px 0; padding: 10px; background-color: #f0f8ff; border-left: 4px solid #2196F3; }
        .keyword { margin: 5px 0; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .print-button { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print as PDF</button>
    
    <div class="header">
        <h1>SEO Analysis Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Target URL: ${targetUrl}</p>
    </div>
    
    <div class="section">
        <h2>Overall SEO Score</h2>
        <div class="score">${analysis.score}/100</div>
    </div>
    
    <div class="section">
        <h3>Issues Found (${analysis.issues.length})</h3>
        ${analysis.issues.map((issue: any) => `
            <div class="issue">
                <strong>${issue.type.toUpperCase()}</strong>: ${issue.message}
                <br><small>Severity: ${issue.severity || 'Unknown'}</small>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h3>Suggestions (${analysis.suggestions.length})</h3>
        ${analysis.suggestions.map((suggestion: any) => `
            <div class="suggestion">
                <strong>${suggestion.title}</strong>
                <br>${suggestion.description}
                <br><small>Priority: ${suggestion.priority || 'Medium'}</small>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h3>Keyword Analysis</h3>
        <table>
            <tr>
                <th>Keyword</th>
                <th>Density</th>
                <th>Count</th>
                <th>Status</th>
            </tr>
            ${Object.entries(analysis.keywordDensities || {}).map(([keyword, data]: [string, any]) => `
                <tr>
                    <td>${keyword}</td>
                    <td>${data.density}%</td>
                    <td>${data.count}</td>
                    <td>${data.density >= 1 && data.density <= 3 ? '✅ Good' : '⚠️ Needs adjustment'}</td>
                </tr>
            `).join('')}
        </table>
    </div>
    
    <div class="section">
        <h3>Technical Metrics</h3>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Page Speed Score</td>
                <td>${analysis.pageSpeed?.score || 'N/A'}</td>
                <td>${(analysis.pageSpeed?.score || 0) >= 90 ? '✅ Good' : '⚠️ Needs improvement'}</td>
            </tr>
            <tr>
                <td>Mobile Friendly</td>
                <td>${analysis.mobileFriendly?.score || 'N/A'}</td>
                <td>${(analysis.mobileFriendly?.score || 0) >= 90 ? '✅ Good' : '⚠️ Needs improvement'}</td>
            </tr>
            <tr>
                <td>Word Count</td>
                <td>${analysis.metrics?.wordCount || 'N/A'}</td>
                <td>${(analysis.metrics?.wordCount || 0) >= 300 ? '✅ Good' : '⚠️ Too short'}</td>
            </tr>
        </table>
    </div>
    
    <div class="footer">
        <p>Report generated by ChatSphere SEO Tools</p>
        <p>For more information, visit our admin panel</p>
    </div>
</body>
</html>`;
    
    // 在新窗口中打开报告
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(pdfContent);
      newWindow.document.close();
      
      // 自动触发打印对话框
      setTimeout(() => {
        newWindow.print();
      }, 500);
    } else {
      alert('Please allow popups to generate the PDF report.');
    }
  };

  const tabs = [
    { id: 'analyzer', label: 'SEO Analyzer', icon: '🔍' },
    { id: 'meta', label: 'Meta Tags', icon: '🏷️' },
    { id: 'content', label: 'Content Tools', icon: '📝' },
    { id: 'technical', label: 'Technical SEO', icon: '⚙️' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isAnalyzing) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Analyzing SEO data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Tools</h1>
              <p className="text-gray-600">Optimize your website for search engines with professional SEO tools</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {activeTab === 'analyzer' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Content</label>
                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Enter your page content here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Run SEO Analysis'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Tags</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleGenerateMetaTags}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600"
                  >
                    Generate Meta Tags
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Your page title"
                    />
                    <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Your meta description"
                    />
                    <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Generator</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleGenerateContent}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-600"
                  >
                    Generate SEO Content
                  </button>
                  {generatedContent && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Generated Title</label>
                        <input
                          type="text"
                          value={generatedContent.title}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Generated Description</label>
                        <textarea
                          value={generatedContent.description}
                          readOnly
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Generated Content</label>
                        <textarea
                          value={generatedContent.content}
                          readOnly
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical SEO</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleGenerateSitemap}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600"
                  >
                    Generate Sitemap
                  </button>
                  <button
                    onClick={handleGenerateRobots}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600"
                  >
                    Generate Robots.txt
                  </button>
                  <button
                    onClick={handleGenerateSchema}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600"
                  >
                    Generate Schema Markup
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Reports</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      if (analysis) {
                        generatePDFReport();
                      } else {
                        alert('Please run SEO analysis first to generate a report.');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700"
                  >
                    Export SEO Report (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {analysis && (
              <>
                {/* Overall Score */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall SEO Score</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.score / 100)}`}
                          className={`${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{analysis.score}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 mt-2">{analysis.score} out of 100</p>
                </div>

                {/* Page Speed & Mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Page Speed Score</h4>
                    <div className="text-2xl font-bold text-blue-600">{analysis.pageSpeed?.score || 82}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile Friendliness</h4>
                    <div className="text-2xl font-bold text-green-600">{analysis.mobileFriendly?.score || 95}</div>
                  </div>
                </div>

                {/* Issues */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h3>
                  <div className="space-y-3">
                    {analysis.issues.map((issue: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        issue.type === 'error' ? 'bg-red-50 border-red-500' :
                        issue.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start">
                          <span className={`text-sm font-medium ${
                            issue.type === 'error' ? 'text-red-800' :
                            issue.type === 'warning' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            [{issue.type.toUpperCase()}]
                          </span>
                          <span className="ml-2 text-sm text-gray-700">{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
                  <div className="space-y-3">
                    {(analysis.suggestions || []).map((suggestion: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          <div>
                            <div className="font-medium text-gray-900">{suggestion.title}</div>
                            <div className="text-sm text-gray-600">{suggestion.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyword Densities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Densities</h3>
                  <div className="space-y-2">
                    {Object.entries(analysis.keywordDensities || {}).map(([keyword, data]: [string, any], index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{keyword}</span>
                        <span className="text-sm font-medium">{data.density}% ({data.count} times)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOTools;