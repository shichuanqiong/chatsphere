// SEO工具服务
export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
  metrics: SEOMetrics;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'meta' | 'content' | 'performance' | 'accessibility' | 'structure';
  message: string;
  severity: 'high' | 'medium' | 'low';
  fixable: boolean;
}

export interface SEOSuggestion {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  implementation: 'easy' | 'medium' | 'hard';
}

export interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  headingStructure: string[];
  imageCount: number;
  linkCount: number;
  wordCount: number;
  loadTime: number;
  mobileFriendly: boolean;
}

// 分析当前页面的SEO
export const analyzeSEO = (): SEOAnalysis => {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let score = 100;

  // 检查页面标题
  const title = document.title;
  if (!title || title.length < 30) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Page title is too short (recommended: 30-60 characters)',
      severity: 'medium',
      fixable: true
    });
    score -= 10;
  } else if (title.length > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Page title is too long (recommended: 30-60 characters)',
      severity: 'medium',
      fixable: true
    });
    score -= 5;
  }

  // 检查meta描述
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  if (!metaDescription) {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Missing meta description',
      severity: 'high',
      fixable: true
    });
    score -= 20;
  } else if (metaDescription.length < 120) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description is too short (recommended: 120-160 characters)',
      severity: 'medium',
      fixable: true
    });
    score -= 10;
  } else if (metaDescription.length > 160) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description is too long (recommended: 120-160 characters)',
      severity: 'medium',
      fixable: true
    });
    score -= 5;
  }

  // 检查H1标签
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: 'Missing H1 tag',
      severity: 'high',
      fixable: true
    });
    score -= 15;
  } else if (h1Tags.length > 1) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'Multiple H1 tags found (recommended: 1 per page)',
      severity: 'medium',
      fixable: true
    });
    score -= 10;
  }

  // 检查图片alt属性
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'warning',
      category: 'accessibility',
      message: `${imagesWithoutAlt.length} images missing alt attributes`,
      severity: 'medium',
      fixable: true
    });
    score -= imagesWithoutAlt.length * 2;
  }

  // 检查内部链接
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
  if (internalLinks.length === 0) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'No internal links found',
      severity: 'low',
      fixable: true
    });
    score -= 5;
  }

  // 检查页面加载性能
  const loadTime = performance.now();
  if (loadTime > 3000) {
    issues.push({
      type: 'warning',
      category: 'performance',
      message: 'Page load time is slow (>3 seconds)',
      severity: 'medium',
      fixable: false
    });
    score -= 15;
  }

  // 生成建议
  if (score < 80) {
    suggestions.push({
      category: 'Content Optimization',
      title: 'Improve Page Content',
      description: 'Add more relevant content and keywords to improve search rankings',
      priority: 'high',
      implementation: 'medium'
    });
  }

  if (imagesWithoutAlt.length > 0) {
    suggestions.push({
      category: 'Accessibility',
      title: 'Add Alt Text to Images',
      description: 'Add descriptive alt text to all images for better accessibility and SEO',
      priority: 'medium',
      implementation: 'easy'
    });
  }

  // 计算指标
  const metrics: SEOMetrics = {
    pageTitle: title,
    metaDescription,
    headingStructure: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.tagName),
    imageCount: images.length,
    linkCount: document.querySelectorAll('a').length,
    wordCount: document.body.innerText.split(/\s+/).length,
    loadTime: Math.round(loadTime),
    mobileFriendly: window.innerWidth <= 768
  };

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    metrics
  };
};

// 生成sitemap
export const generateSitemap = (): string => {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
};

// 生成robots.txt
export const generateRobotsTxt = (): string => {
  const baseUrl = window.location.origin;
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;
};

// 检查关键词密度
export const analyzeKeywordDensity = (keywords: string[]): { [keyword: string]: { count: number; density: number } } => {
  const text = document.body.innerText.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  const results: { [keyword: string]: { count: number; density: number } } = {};
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const regex = new RegExp(`\\b${keywordLower}\\b`, 'g');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
    
    results[keyword] = { count, density: Math.round(density * 100) / 100 };
  });
  
  return results;
};

// 检查页面速度
export const analyzePageSpeed = (url?: string): Promise<{ score: number; metrics: any }> => {
  return new Promise((resolve) => {
    // 模拟页面速度分析
    const loadTime = performance.now();
    const score = loadTime < 1000 ? 100 : loadTime < 2000 ? 80 : loadTime < 3000 ? 60 : 40;
    
    resolve({
      score,
      metrics: {
        loadTime: Math.round(loadTime),
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      }
    });
  });
};

// 检查移动端友好性
export const analyzeMobileFriendly = (url?: string): { score: number; issues: string[] } => {
  const issues: string[] = [];
  let score = 100;
  
  // 检查viewport meta标签
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push('Missing viewport meta tag');
    score -= 30;
  }
  
  // 检查触摸目标大小
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
  const smallTargets = Array.from(touchTargets).filter(target => {
    const rect = target.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44;
  });
  
  if (smallTargets.length > 0) {
    issues.push(`${smallTargets.length} touch targets are too small (< 44px)`);
    score -= smallTargets.length * 5;
  }
  
  // 检查字体大小
  const smallTexts = Array.from(document.querySelectorAll('*')).filter(el => {
    const fontSize = window.getComputedStyle(el).fontSize;
    return parseFloat(fontSize) < 16;
  });
  
  if (smallTexts.length > 0) {
    issues.push(`${smallTexts.length} text elements have font size < 16px`);
    score -= Math.min(smallTexts.length * 2, 20);
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
};

// 生成SEO报告
export const generateSEOReport = async (): Promise<string> => {
  const analysis = analyzeSEO();
  const keywordDensity = analyzeKeywordDensity(['chat', 'social', 'community', 'messaging']);
  const pageSpeed = await analyzePageSpeed();
  const mobileFriendly = analyzeMobileFriendly();
  
  const report = `
# SEO Analysis Report
Generated: ${new Date().toLocaleString()}

## Overall Score: ${analysis.score}/100

## Issues Found (${analysis.issues.length})
${analysis.issues.map(issue => 
  `- [${issue.severity.toUpperCase()}] ${issue.message}`
).join('\n')}

## Suggestions
${analysis.suggestions.map(suggestion => 
  `- ${suggestion.title}: ${suggestion.description}`
).join('\n')}

## Metrics
- Page Title: ${analysis.metrics.pageTitle}
- Meta Description: ${analysis.metrics.metaDescription}
- Word Count: ${analysis.metrics.wordCount}
- Image Count: ${analysis.metrics.imageCount}
- Link Count: ${analysis.metrics.linkCount}
- Load Time: ${analysis.metrics.loadTime}ms

## Keyword Density
${Object.entries(keywordDensity).map(([keyword, data]) => 
  `- ${keyword}: ${data.count} occurrences (${data.density}%)`
).join('\n')}

## Performance Score: ${pageSpeed.score}/100
- Load Time: ${pageSpeed.metrics.loadTime}ms

## Mobile Friendly Score: ${mobileFriendly.score}/100
${mobileFriendly.issues.length > 0 ? 
  `Issues:\n${mobileFriendly.issues.map(issue => `- ${issue}`).join('\n')}` : 
  'No mobile issues found'
}
`;
  
  return report;
};
