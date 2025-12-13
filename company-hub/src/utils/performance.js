// Performance optimization utilities

// Debounce function to limit API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization for expensive computations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Lazy loading for images
export const lazyLoadImage = (img) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = image.dataset.src;
        image.classList.remove('lazy');
        observer.unobserve(image);
      }
    });
  });

  observer.observe(img);
};

// Virtual scrolling for large lists
export const createVirtualScroll = (container, itemHeight, renderItem) => {
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    container.children.length
  );

  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight
  };
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Async performance monitoring
export const measureAsyncPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Component performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    const endTime = performance.now();
    console.log(`${componentName} rendered in ${endTime - startTime.current} milliseconds`);
  });
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Preload critical resources
export const preloadResource = (url, type = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

// Cache API responses
export const createCache = (maxSize = 100) => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    has: (key) => cache.has(key),
    clear: () => cache.clear(),
    size: () => cache.size
  };
};

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  // This would typically use an image optimization service
  // For now, just return the original src
  return src;
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      console.log(`Bundle: ${script.src} - Size: ${script.getAttribute('data-size') || 'Unknown'}`);
    });
  }
};

// Memory leak prevention
export const cleanup = (cleanupFn) => {
  // Return a cleanup function that can be called in useEffect cleanup
  return () => {
    try {
      cleanupFn();
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  };
};

// Event listener cleanup
export const addEventListenerWithCleanup = (element, event, handler, options) => {
  element.addEventListener(event, handler, options);
  return () => {
    element.removeEventListener(event, handler, options);
  };
};

// Timer cleanup
export const setTimeoutWithCleanup = (callback, delay) => {
  const timerId = setTimeout(callback, delay);
  return () => clearTimeout(timerId);
};

// Interval cleanup
export const setIntervalWithCleanup = (callback, interval) => {
  const intervalId = setInterval(callback, interval);
  return () => clearInterval(intervalId);
};
