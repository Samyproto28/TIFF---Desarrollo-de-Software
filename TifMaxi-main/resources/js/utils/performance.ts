// Performance optimization utilities

/**
 * Debounce function to limit the rate at which a function gets called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function to limit the rate at which a function gets called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load images when they come into viewport
 */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

/**
 * Preload critical resources
 */
export function preloadResources(resources: string[]) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type based on file extension
    const extension = resource.split('.').pop()?.toLowerCase();
    if (extension === 'js') {
      link.as = 'script';
    } else if (extension === 'css') {
      link.as = 'style';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      link.as = 'image';
    } else if (['woff', 'woff2', 'ttf', 'eot'].includes(extension || '')) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Measure performance metrics
 */
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return end - start;
}

/**
 * Create a performance observer to monitor specific metrics
 */
export function createPerformanceObserver(callback: (entries: PerformanceEntry[]) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    
    return observer;
  }
  
  return null;
}

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals() {
  // Largest Contentful Paint (LCP)
  const lcpObserver = createPerformanceObserver((entries) => {
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  });
  
  if (lcpObserver) {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  // First Input Delay (FID)
  const fidObserver = createPerformanceObserver((entries) => {
    entries.forEach(entry => {
      // Type assertion for PerformanceEventTiming
      const timingEntry = entry as PerformanceEventTiming;
      console.log('FID:', timingEntry.processingStart - timingEntry.startTime);
    });
  });
  
  if (fidObserver) {
    fidObserver.observe({ entryTypes: ['first-input'] });
  }
  
  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = createPerformanceObserver((entries) => {
    entries.forEach(entry => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });
    
    console.log('CLS:', clsValue);
  });
  
  if (clsObserver) {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * Optimize images for different screen sizes
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  width?: number,
  height?: number,
  quality = 80
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
}

/**
 * Create a responsive image with multiple sources
 */
export function createResponsiveImage(
  baseUrl: string,
  alt: string,
  className = '',
  sizes = '100vw'
): HTMLPictureElement {
  const picture = document.createElement('picture');
  
  // Create sources for different screen sizes
  const sources = [
    { media: '(min-width: 1024px)', width: 1024 },
    { media: '(min-width: 768px)', width: 768 },
    { media: '(min-width: 640px)', width: 640 },
  ];
  
  sources.forEach(({ media, width }) => {
    const source = document.createElement('source');
    source.media = media;
    source.srcset = getOptimizedImageUrl(baseUrl, width);
    source.sizes = sizes;
    picture.appendChild(source);
  });
  
  // Create fallback img
  const img = document.createElement('img');
  img.src = getOptimizedImageUrl(baseUrl);
  img.alt = alt;
  img.className = className;
  img.loading = 'lazy';
  img.sizes = sizes;
  
  picture.appendChild(img);
  
  return picture;
}

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller<T> {
  private items: T[];
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop = 0;
  private container: HTMLElement | null = null;
  
  constructor(
    items: T[],
    itemHeight: number,
    containerHeight: number
  ) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }
  
  get visibleItems(): { item: T; index: number; top: number }[] {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.items.length
    );
    
    const visibleItems: { item: T; index: number; top: number }[] = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      visibleItems.push({
        item: this.items[i],
        index: i,
        top: i * this.itemHeight,
      });
    }
    
    return visibleItems;
  }
  
  get totalHeight(): number {
    return this.items.length * this.itemHeight;
  }
  
  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
  }
  
  attachToContainer(container: HTMLElement) {
    this.container = container;
    
    container.addEventListener('scroll', () => {
      this.updateScrollTop(container.scrollTop);
    });
  }
}

/**
 * Memoize function to cache expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * RequestIdleCallback utility for non-critical tasks
 */
export function runWhenIdle(callback: () => void, timeout = 5000) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Service Worker registration for offline support
 */
export async function registerServiceWorker(scriptUrl: string) {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(scriptUrl);
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service Worker is not supported in this browser');
    return null;
  }
}