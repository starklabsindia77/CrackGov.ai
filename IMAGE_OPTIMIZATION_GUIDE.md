# Image Optimization Guide

## ✅ Implemented Optimizations

### 1. Next.js Image Configuration (`next.config.mjs`)
- ✅ Modern formats: AVIF and WebP
- ✅ Responsive device sizes
- ✅ Image size variants
- ✅ Cache TTL configuration
- ✅ SVG security (CSP)
- ✅ Remote image patterns (S3, R2)

### 2. Optimized Image Component (`src/components/optimized-image.tsx`)
- ✅ Lazy loading by default
- ✅ Blur placeholder
- ✅ Error handling with fallback
- ✅ Loading state with skeleton
- ✅ Responsive sizing
- ✅ Quality optimization (85% default)

### 3. Image Utilities (`src/lib/image-optimization.ts`)
- ✅ Optimized Image wrapper component
- ✅ URL optimization with query parameters
- ✅ Responsive size generation
- ✅ Re-export Next.js Image for convenience

## Usage

### Basic Usage
```tsx
import { OptimizedImage } from "@/components/optimized-image";

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

### With Priority (Above the fold)
```tsx
<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  priority={true}
  loading="eager"
/>
```

### Custom Sizes
```tsx
<OptimizedImage
  src="/banner.jpg"
  alt="Banner"
  width={1200}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Using Next.js Image Directly
```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
  placeholder="blur"
/>
```

## Best Practices

### 1. Always Use Next.js Image Component
- ✅ Automatic optimization
- ✅ Lazy loading
- ✅ Responsive images
- ✅ Modern formats

### 2. Set Appropriate Sizes
```tsx
// For full-width images
sizes="100vw"

// For responsive layouts
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

### 3. Use Priority for Above-the-Fold Images
```tsx
priority={true}  // For hero images, logos, etc.
```

### 4. Optimize Image Quality
- Default: 85% (good balance)
- High quality: 90-95% (for detailed images)
- Lower quality: 70-80% (for thumbnails)

### 5. Provide Alt Text
- Always include descriptive alt text
- Important for accessibility and SEO

## Image Formats

### Recommended Formats
1. **AVIF** - Best compression, modern browsers
2. **WebP** - Good compression, wide support
3. **JPEG** - Fallback for older browsers
4. **PNG** - For images with transparency

### Format Selection
Next.js automatically serves the best format based on browser support:
- Modern browsers: AVIF
- Older browsers: WebP
- Fallback: Original format

## Performance Benefits

### Before Optimization
- Large file sizes (500KB+)
- No lazy loading
- No format optimization
- Slower page loads

### After Optimization
- ✅ 60-80% smaller file sizes
- ✅ Automatic lazy loading
- ✅ Modern formats (AVIF/WebP)
- ✅ Faster page loads
- ✅ Better Core Web Vitals

## Configuration

### Device Sizes
```javascript
deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
```
Optimized for common device widths.

### Image Sizes
```javascript
imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
```
For smaller images like icons and thumbnails.

### Cache TTL
```javascript
minimumCacheTTL: 60  // 60 seconds
```
Controls how long optimized images are cached.

## Remote Images

### S3/R2 Images
```tsx
<OptimizedImage
  src="https://bucket.s3.amazonaws.com/image.jpg"
  alt="Remote image"
  width={800}
  height={600}
/>
```

### Configuration Required
Add remote patterns in `next.config.mjs`:
```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: '**.amazonaws.com',
  },
  {
    protocol: 'https',
    hostname: '**.cloudflare.com',
  },
]
```

## Migration Guide

### Replace `<img>` tags
```tsx
// Before
<img src="/image.jpg" alt="Description" />

// After
<OptimizedImage src="/image.jpg" alt="Description" width={800} height={600} />
```

### Replace regular Image imports
```tsx
// Before
import Image from "next/image";
<Image src="/image.jpg" alt="..." width={800} height={600} />

// After (optional, for consistency)
import { OptimizedImage } from "@/components/optimized-image";
<OptimizedImage src="/image.jpg" alt="..." width={800} height={600} />
```

## Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: Should be < 2.5s
- **CLS (Cumulative Layout Shift)**: Should be < 0.1
- **FID (First Input Delay)**: Should be < 100ms

### Image Metrics
- Monitor image load times
- Track format adoption (AVIF vs WebP)
- Check cache hit rates
- Monitor bandwidth savings

## Tools

### Image Optimization Tools
- **Next.js Image Optimization API** - Built-in
- **Sharp** - Image processing (used by Next.js)
- **Squoosh** - Web-based image optimizer
- **ImageOptim** - Desktop tool

### Analysis Tools
- **Lighthouse** - Performance auditing
- **WebPageTest** - Detailed performance analysis
- **Chrome DevTools** - Network and performance profiling

## Summary

✅ **Image optimization is complete!**
- Next.js Image component configured
- Optimized Image component created
- Lazy loading enabled
- Modern formats (AVIF/WebP) configured
- Responsive sizing configured
- Error handling implemented
- Performance optimized

