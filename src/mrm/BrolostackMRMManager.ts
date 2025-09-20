/**
 * Brolostack Multi-Rendering Mode (MRM) Manager
 * Provides enhanced performance through SSR, SSG, and hybrid pre-rendering capabilities
 */

import { Brolostack } from '../core/Brolostack';
import { Logger } from '../utils/Logger';

export interface MRMConfig {
  mode: 'ssr' | 'ssg' | 'hybrid';
  cacheStrategy: 'none' | 'memory' | 'disk' | 'redis';
  cacheMaxAge?: number;
  prerenderRoutes?: string[];
  staticGeneration?: {
    outputDir: string;
    buildTime: boolean;
    incremental: boolean;
  };
  hydration?: {
    strategy: 'immediate' | 'lazy' | 'on-demand';
    chunkSize?: number;
  };
}

export interface RenderContext {
  url: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  userAgent: string;
  isBot: boolean;
  timestamp: Date;
}

export interface RenderResult {
  html: string;
  metadata: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTags?: Record<string, string>;
    jsonLd?: Record<string, any>[];
  };
  performance: {
    renderTime: number;
    cacheHit: boolean;
    hydrationData?: any;
  };
  headers: Record<string, string>;
}

export class BrolostackMRMManager {
  private config: MRMConfig;
  private brolostack: Brolostack;
  private logger: Logger;
  private renderCache: Map<string, { result: RenderResult; timestamp: Date }> = new Map();
  private isServerEnvironment: boolean;

  constructor(brolostack: Brolostack, config: MRMConfig) {
    this.brolostack = brolostack;
    this.config = config;
    this.logger = new Logger(false, 'BrolostackMRMManager');
    this.isServerEnvironment = typeof window === 'undefined';
  }

  /**
   * Render React components for SSR/SSG
   */
  async renderReact(component: any, context: RenderContext, initialData?: any): Promise<RenderResult> {
    const startTime = Date.now();
    
    try {
      // This would integrate with React's renderToString in a real implementation
      const html = await this.renderComponentToString(component, initialData);
      
      const result: RenderResult = {
        html,
        metadata: {
          title: context.url,
          description: `Rendered with Brolostack SSR`,
        },
        performance: {
          renderTime: Date.now() - startTime,
          cacheHit: false,
          hydrationData: initialData
        },
        headers: {
          'Content-Type': 'text/html',
          'X-Rendered-By': 'Brolostack-SSR'
        }
      };
      
      return result;
    } catch (error) {
      this.logger.error('React render failed:', error);
      throw error;
    }
  }

  /**
   * Generate static pages for SSG
   */
  async generateStaticPages(routes: string[], _outputDir: string): Promise<void> {
    if (!this.config.staticGeneration?.buildTime) {
      throw new Error('Static generation not enabled');
    }

    this.logger.info(`Generating static pages for ${routes.length} routes`);
    
    for (const route of routes) {
      try {
        const context: RenderContext = {
          url: route,
          headers: {},
          cookies: {},
          userAgent: 'Brolostack-SSG',
          isBot: true,
          timestamp: new Date()
        };
        
        await this.render(context);
        
        // In a real implementation, this would write to the filesystem
        this.logger.info(`Generated static page: ${route}`);
        
      } catch (error) {
        this.logger.error(`Failed to generate static page for ${route}:`, error);
      }
    }
  }

  /**
   * Extract initial data for hydration
   */
  async extractInitialData(): Promise<any> {
    const data: any = {};
    
    // Get all store states
    const stores = this.brolostack.stores;
    for (const [name, store] of stores) {
      data[name] = store.getState();
    }
    
    // Get AI memory if available
    if (this.brolostack.ai) {
      data._aiMemory = await this.brolostack.ai.getMemory();
    }
    
    return data;
  }

  /**
   * Create hydration script for client-side
   */
  createHydrationScript(data: any): string {
    return `
      <script>
        window.__BROLOSTACK_INITIAL_DATA__ = ${JSON.stringify(data)};
        window.__BROLOSTACK_SSR_MODE__ = '${this.config.mode}';
        window.__BROLOSTACK_HYDRATION_STRATEGY__ = '${this.config.hydration?.strategy || 'immediate'}';
      </script>
    `;
  }

  async render(context: RenderContext): Promise<RenderResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(context);

    try {
      // Check cache first
      if (this.config.cacheStrategy !== 'none') {
        const cached = await this.getCachedResult(cacheKey);
        if (cached) {
          this.logger.info(`Cache hit for ${context.url}`);
          return {
            ...cached,
            performance: {
              ...cached.performance,
              cacheHit: true,
              renderTime: Date.now() - startTime
            }
          };
        }
      }

      // Perform server-side rendering
      const renderResult = await this.performRender(context);
      
      // Cache the result
      if (this.config.cacheStrategy !== 'none') {
        await this.cacheResult(cacheKey, renderResult);
      }

      renderResult.performance.renderTime = Date.now() - startTime;
      renderResult.performance.cacheHit = false;

      this.logger.info(`Rendered ${context.url} in ${renderResult.performance.renderTime}ms`);
      return renderResult;

    } catch (error) {
      this.logger.error(`SSR failed for ${context.url}:`, error);
      throw error;
    }
  }

  async generateStatic(routes: string[] = []): Promise<Map<string, RenderResult>> {
    if (this.config.mode !== 'ssg' && this.config.mode !== 'hybrid') {
      throw new Error('Static generation is only available in SSG or hybrid mode');
    }

    const results = new Map<string, RenderResult>();
    const routesToGenerate = routes.length > 0 ? routes : (this.config.prerenderRoutes || []);

    this.logger.info(`Generating static pages for ${routesToGenerate.length} routes`);

    for (const route of routesToGenerate) {
      try {
        const context: RenderContext = {
          url: route,
          headers: {},
          cookies: {},
          userAgent: 'Brolostack SSG Generator',
          isBot: false,
          timestamp: new Date()
        };

        const result = await this.render(context);
        results.set(route, result);

        // Write to disk if configured
        if (this.config.staticGeneration?.outputDir) {
          await this.writeStaticFile(route, result);
        }

      } catch (error) {
        this.logger.error(`Failed to generate static page for ${route}:`, error);
      }
    }

    this.logger.info(`Generated ${results.size} static pages`);
    return results;
  }

  async hydrate(element: HTMLElement, data: any): Promise<void> {
    if (this.isServerEnvironment) {
      return; // No hydration needed on server
    }

    try {
      const strategy = this.config.hydration?.strategy || 'immediate';

      switch (strategy) {
        case 'immediate':
          await this.immediateHydration(element, data);
          break;
        case 'lazy':
          await this.lazyHydration(element, data);
          break;
        case 'on-demand':
          await this.onDemandHydration(element, data);
          break;
      }

      this.logger.info('Hydration completed');
    } catch (error) {
      this.logger.error('Hydration failed:', error);
      throw error;
    }
  }

  // SEO and Metadata Management
  generateMetadata(context: RenderContext, data: any): RenderResult['metadata'] {
    const metadata: RenderResult['metadata'] = {
      title: this.extractTitle(data) || 'Brolostack Application',
      description: this.extractDescription(data) || 'Built with Brolostack - Zero-cost full-stack framework',
      keywords: this.extractKeywords(data) || ['brolostack', 'full-stack', 'framework'],
      ogTags: {
        'og:type': 'website',
        'og:url': context.url,
        'og:title': this.extractTitle(data) || 'Brolostack Application',
        'og:description': this.extractDescription(data) || 'Built with Brolostack',
        'og:site_name': 'Brolostack Application'
      }
    };

    // Add JSON-LD structured data
    metadata.jsonLd = this.generateJsonLd(context, data);

    return metadata;
  }

  // Performance Optimization
  async preloadCriticalResources(context: RenderContext): Promise<string[]> {
    const resources: string[] = [];

    // Analyze the page to determine critical resources
    const criticalCSS = await this.extractCriticalCSS(context);
    if (criticalCSS) {
      resources.push(`<style>${criticalCSS}</style>`);
    }

    // Preload critical JavaScript modules
    const criticalJS = await this.extractCriticalJS(context);
    criticalJS.forEach(js => {
      resources.push(`<link rel="modulepreload" href="${js}">`);
    });

    // Preload critical fonts
    const criticalFonts = await this.extractCriticalFonts(context);
    criticalFonts.forEach(font => {
      resources.push(`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin>`);
    });

    return resources;
  }

  // Cache Management
  async invalidateCache(pattern?: string): Promise<void> {
    if (pattern) {
      // Invalidate specific cache entries
      const keysToDelete: string[] = [];
      for (const key of this.renderCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.renderCache.delete(key));
    } else {
      // Clear entire cache
      this.renderCache.clear();
    }

    this.logger.info(`Cache invalidated${pattern ? ` for pattern: ${pattern}` : ' completely'}`);
  }

  // Private Methods
  private async performRender(context: RenderContext): Promise<RenderResult> {
    // Initialize Brolostack for server-side rendering
    await this.brolostack.initialize();

    // Load initial data based on the route
    const initialData = await this.loadInitialData(context);

    // Render the application to HTML
    const html = await this.renderToString(context, initialData);

    // Generate metadata
    const metadata = this.generateMetadata(context, initialData);

    // Prepare hydration data
    const hydrationData = this.prepareHydrationData(initialData);

    // Generate response headers
    const headers = this.generateHeaders(context, metadata);

    return {
      html,
      metadata,
      performance: {
        renderTime: 0, // Will be set by caller
        cacheHit: false,
        hydrationData
      },
      headers
    };
  }

  private async loadInitialData(_context: RenderContext): Promise<any> {
    // Load data needed for server-side rendering
    // This would typically involve calling APIs, loading from database, etc.
    
    // Get all available stores (simplified implementation)
    const stores: any[] = [];
    const initialData: any = {};

    for (const [storeName, store] of stores) {
      // Load initial state for each store
      initialData[storeName] = await store.getState();
    }

    return initialData;
  }

  private async renderToString(context: RenderContext, data: any): Promise<string> {
    // This would integrate with your chosen rendering engine
    // For React: ReactDOMServer.renderToString()
    // For Vue: @vue/server-renderer
    // For vanilla JS: custom template engine
    
    const template = await this.getTemplate(context);
    const renderedContent = await this.processTemplate(template, data);
    
    return this.wrapInDocument(renderedContent, context, data);
  }

  private async getTemplate(_context: RenderContext): Promise<string> {
    // Load appropriate template based on route
    // This is a simplified implementation
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        {{HEAD}}
      </head>
      <body>
        <div id="app">{{CONTENT}}</div>
        {{SCRIPTS}}
      </body>
      </html>
    `;
  }

  private async processTemplate(template: string, data: any): Promise<string> {
    // Simple template processing - replace placeholders with actual content
    let processed = template;
    
    // Replace data placeholders
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });

    return processed;
  }

  private wrapInDocument(content: string, context: RenderContext, data: any): string {
    const metadata = this.generateMetadata(context, data);
    
    let html = content;

    // Insert metadata into head
    const headContent = this.generateHeadContent(metadata);
    html = html.replace('{{HEAD}}', headContent);

    // Insert hydration script
    const hydrationScript = this.generateHydrationScript(data);
    html = html.replace('{{SCRIPTS}}', hydrationScript);

    return html;
  }

  private generateHeadContent(metadata: RenderResult['metadata']): string {
    let head = '';

    if (metadata.title) {
      head += `<title>${metadata.title}</title>\n`;
    }

    if (metadata.description) {
      head += `<meta name="description" content="${metadata.description}">\n`;
    }

    if (metadata.keywords) {
      head += `<meta name="keywords" content="${metadata.keywords.join(', ')}">\n`;
    }

    // Open Graph tags
    if (metadata.ogTags) {
      for (const [property, content] of Object.entries(metadata.ogTags)) {
        head += `<meta property="${property}" content="${content}">\n`;
      }
    }

    // JSON-LD structured data
    if (metadata.jsonLd && metadata.jsonLd.length > 0) {
      metadata.jsonLd.forEach(jsonLd => {
        head += `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`;
      });
    }

    return head;
  }

  private generateHydrationScript(data: any): string {
    return `
      <script>
        window.__BROLOSTACK_SSR_DATA__ = ${JSON.stringify(data)};
      </script>
      <script type="module">
        import { Brolostack } from '/dist/index.esm.js';
        
        // Initialize client-side Brolostack with SSR data
        const app = new Brolostack();
        await app.hydrate(window.__BROLOSTACK_SSR_DATA__);
      </script>
    `;
  }

  private generateCacheKey(context: RenderContext): string {
    const key = `${context.url}_${context.userAgent}_${JSON.stringify(context.cookies)}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
  }

  private async getCachedResult(key: string): Promise<RenderResult | null> {
    const cached = this.renderCache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (this.config.cacheMaxAge) {
      const age = Date.now() - cached.timestamp.getTime();
      if (age > this.config.cacheMaxAge * 1000) {
        this.renderCache.delete(key);
        return null;
      }
    }

    return cached.result;
  }

  private async cacheResult(key: string, result: RenderResult): Promise<void> {
    this.renderCache.set(key, {
      result,
      timestamp: new Date()
    });
  }

  private async writeStaticFile(route: string, _result: RenderResult): Promise<void> {
    if (!this.config.staticGeneration?.outputDir) {
      return;
    }

    // This would write the file to disk in a real implementation
    // For now, just log what would be written
    this.logger.info(`Would write static file for ${route} to ${this.config.staticGeneration.outputDir}`);
  }

  private async immediateHydration(_element: HTMLElement, data: any): Promise<void> {
    // Hydrate immediately when DOM is ready
    // Note: hydrate method would need to be implemented in Brolostack core
    console.log('Immediate hydration with data:', data);
  }

  private async lazyHydration(element: HTMLElement, data: any): Promise<void> {
    // Hydrate when element comes into viewport
    const observer = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Note: hydrate method would need to be implemented in Brolostack core
          console.log('Lazy hydration with data:', data);
          observer.disconnect();
        }
      }
    });

    observer.observe(element);
  }

  /**
   * Render component to string (placeholder for React integration)
   */
  private async renderComponentToString(_component: any, initialData?: any): Promise<string> {
    // This is a placeholder - in a real implementation, this would use React's renderToString
    // and integrate with the actual React component tree
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Brolostack SSR</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <!-- Component would be rendered here -->
            <div>Brolostack SSR Rendered Component</div>
          </div>
          ${this.createHydrationScript(initialData || {})}
        </body>
      </html>
    `;
  }

  private async onDemandHydration(element: HTMLElement, data: any): Promise<void> {
    // Hydrate on first user interaction
    const events = ['click', 'keydown', 'touchstart'];
    
    const hydrate = async () => {
      // Note: hydrate method would need to be implemented in Brolostack core
      console.log('Progressive hydration with data:', data);
      events.forEach(event => element.removeEventListener(event, hydrate));
    };

    events.forEach(event => element.addEventListener(event, hydrate, { once: true }));
  }

  private extractTitle(data: any): string | undefined {
    return data.page?.title || data.meta?.title;
  }

  private extractDescription(data: any): string | undefined {
    return data.page?.description || data.meta?.description;
  }

  private extractKeywords(data: any): string[] | undefined {
    return data.page?.keywords || data.meta?.keywords;
  }

  private generateJsonLd(context: RenderContext, data: any): Record<string, any>[] {
    const jsonLd = [];

    // Basic organization schema
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Brolostack Application',
      'url': context.url
    });

    // Add page-specific schema if available
    if (data.schema) {
      jsonLd.push(data.schema);
    }

    return jsonLd;
  }

  private async extractCriticalCSS(_context: RenderContext): Promise<string | null> {
    // Extract CSS that's needed for above-the-fold content
    // This would analyze the rendered page and extract critical styles
    return null; // Placeholder
  }

  private async extractCriticalJS(_context: RenderContext): Promise<string[]> {
    // Identify JavaScript modules needed for initial page load
    return ['/dist/index.esm.js']; // Placeholder
  }

  private async extractCriticalFonts(_context: RenderContext): Promise<string[]> {
    // Identify fonts needed for above-the-fold content
    return []; // Placeholder
  }

  private prepareHydrationData(data: any): any {
    // Prepare data for client-side hydration
    return {
      stores: data,
      timestamp: Date.now(),
      version: '1.0.2'
    };
  }

  private generateHeaders(_context: RenderContext, _metadata: RenderResult['metadata']): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Brolostack SSR'
    };

    // Add caching headers
    if (this.config.cacheMaxAge) {
      headers['Cache-Control'] = `public, max-age=${this.config.cacheMaxAge}`;
    }

    return headers;
  }
}
