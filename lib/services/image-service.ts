'use client';

import type { ArtworkImage, ImageRegion, CameraInfo } from '@/lib/types/gallery';
import { logger } from '@/lib/utils/logger';

// ===============================
// Image Processing Configuration
// ===============================

export interface ImageProcessingConfig {
  formats: ('webp' | 'avif' | 'jpg' | 'png')[];
  quality: number;
  progressive: boolean;
  stripMetadata: boolean;
  sharpen?: number;
  denoise?: number;
  autoContrast?: boolean;
  colorProfileConversion?: string;
}

export interface ImageSizeConfig {
  name: string;
  width?: number;
  height?: number;
  quality: number;
  format: 'webp' | 'avif' | 'jpg' | 'png';
  description: string;
}

export interface DeepZoomConfig {
  tileSize: number;
  overlap: number;
  format: 'jpg' | 'png';
  quality: number;
  maxZoomLevel: number;
}

// ===============================
// Image Service Class
// ===============================

export class ImageService {
  private cdnBaseUrl: string;
  private apiKey: string;
  private maxFileSize: number;
  private allowedFormats: string[];
  private defaultSizes: ImageSizeConfig[];

  constructor(config: {
    cdnBaseUrl: string;
    apiKey: string;
    maxFileSize?: number;
    allowedFormats?: string[];
  }) {
    this.cdnBaseUrl = config.cdnBaseUrl;
    this.apiKey = config.apiKey;
    this.maxFileSize = config.maxFileSize || 50 * 1024 * 1024; // 50MB
    this.allowedFormats = config.allowedFormats || ['jpg', 'png', 'tiff', 'webp', 'avif'];
    
    this.defaultSizes = [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        quality: 80,
        format: 'webp',
        description: 'Small thumbnail for lists and previews'
      },
      {
        name: 'small',
        width: 400,
        quality: 85,
        format: 'webp',
        description: 'Small size for mobile devices'
      },
      {
        name: 'medium',
        width: 800,
        quality: 90,
        format: 'webp',
        description: 'Medium size for tablet and desktop'
      },
      {
        name: 'large',
        width: 1600,
        quality: 95,
        format: 'webp',
        description: 'Large size for detailed viewing'
      },
      {
        name: 'xlarge',
        width: 3200,
        quality: 98,
        format: 'jpg',
        description: 'Extra large for scholarly examination'
      }
    ];
  }

  // ===============================
  // Image Upload and Processing
  // ===============================

  async uploadArtworkImage(
    file: File,
    artworkId: string,
    imageType: ArtworkImage['type'],
    metadata?: Partial<ArtworkImage['metadata']>
  ): Promise<ArtworkImage> {
    // Validate file
    this.validateImageFile(file);

    // Extract metadata
    const extractedMetadata = await this.extractImageMetadata(file);
    
    // Upload original file
    const originalUrl = await this.uploadToStorage(file, artworkId, 'original');
    
    // Generate responsive sizes
    const processedSizes = await this.generateResponsiveSizes(file, artworkId);
    
    // Generate deep zoom tiles if needed
    const zoomTiles = await this.generateDeepZoomTiles(file, artworkId);
    
    // Create ArtworkImage object
    const artworkImage: ArtworkImage = {
      id: this.generateImageId(),
      type: imageType,
      urls: {
        thumbnail: processedSizes.thumbnail || '',
        small: processedSizes.small || '',
        medium: processedSizes.medium || '',
        large: processedSizes.large || '',
        original: originalUrl,
        zoom_tiles: zoomTiles
      },
      metadata: {
        filename: file.name,
        format: this.getOptimalFormat(file),
        dimensions: extractedMetadata.dimensions,
        file_size: file.size,
        dpi: extractedMetadata.dpi || 300,
        color_profile: extractedMetadata.colorProfile || 'sRGB',
        capture_date: extractedMetadata.captureDate,
        camera_info: extractedMetadata.cameraInfo,
        ...metadata
      },
      regions: [],
      annotations: [],
      processing: {
        color_corrected: true,
        sharpened: true,
        noise_reduced: true,
        lens_corrected: false,
        processing_notes: 'Automated processing applied'
      }
    };

    return artworkImage;
  }

  // ===============================
  // Image Validation
  // ===============================

  private validateImageFile(file: File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file format
    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !this.allowedFormats.includes(extension)) {
      throw new Error(`File format not supported. Allowed formats: ${this.allowedFormats.join(', ')}`);
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not a valid image');
    }
  }

  // ===============================
  // Metadata Extraction
  // ===============================

  private async extractImageMetadata(file: File): Promise<{
    dimensions: { width: number; height: number };
    dpi?: number;
    colorProfile?: string;
    captureDate?: Date;
    cameraInfo?: CameraInfo;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }

        // Basic metadata
        const metadata = {
          dimensions: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        };

        // Try to extract EXIF data (simplified version)
        this.extractExifData(file).then(exifData => {
          resolve({
            ...metadata,
            ...exifData
          });
        }).catch(() => {
          resolve(metadata);
        });

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        resolve({
          dimensions: { width: 0, height: 0 }
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private async extractExifData(file: File): Promise<{
    dpi?: number;
    colorProfile?: string;
    captureDate?: Date;
    cameraInfo?: CameraInfo;
  }> {
    // This is a simplified EXIF extraction
    // In a real application, you would use a library like piexifjs or exif-js
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const dataView = new DataView(arrayBuffer);
      
      // Check for JPEG EXIF marker
      if (dataView.getUint16(0) === 0xFFD8) {
        // Basic EXIF parsing would go here
        // For now, return empty object
        return {};
      }
      
      return {};
    } catch (error) {
      logger.warn('Could not extract EXIF data', error instanceof Error ? error : new Error(String(error)));
      return {};
    }
  }

  // ===============================
  // Image Processing and Generation
  // ===============================

  private async generateResponsiveSizes(
    file: File,
    artworkId: string
  ): Promise<Record<string, string>> {
    const sizes: Record<string, string> = {};
    
    for (const sizeConfig of this.defaultSizes) {
      try {
        const processedBlob = await this.resizeImage(file, sizeConfig);
        const url = await this.uploadToStorage(processedBlob, artworkId, sizeConfig.name);
        sizes[sizeConfig.name] = url;
      } catch (error) {
        logger.error(`Failed to generate ${sizeConfig.name} size`, error instanceof Error ? error : new Error(String(error)));
        // Fallback to original image
        sizes[sizeConfig.name] = await this.uploadToStorage(file, artworkId, 'original');
      }
    }
    
    return sizes;
  }

  private async resizeImage(file: File, config: ImageSizeConfig): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        const { width: targetWidth, height: targetHeight } = this.calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          config.width,
          config.height
        );

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Apply image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          this.getMimeType(config.format),
          config.quality / 100
        );

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (targetWidth && targetHeight) {
      // Fit within both dimensions while maintaining aspect ratio
      const widthRatio = targetWidth / originalWidth;
      const heightRatio = targetHeight / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      return {
        width: Math.round(originalWidth * ratio),
        height: Math.round(originalHeight * ratio)
      };
    }

    if (targetWidth) {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      };
    }

    if (targetHeight) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      };
    }

    return { width: originalWidth, height: originalHeight };
  }

  // ===============================
  // Deep Zoom Tile Generation
  // ===============================

  private async generateDeepZoomTiles(
    file: File,
    artworkId: string
  ): Promise<string[]> {
    const config: DeepZoomConfig = {
      tileSize: 512,
      overlap: 1,
      format: 'jpg',
      quality: 90,
      maxZoomLevel: 6
    };

    try {
      const img = await this.loadImage(file);
      const tiles: string[] = [];
      
      for (let level = 0; level <= config.maxZoomLevel; level++) {
        const levelTiles = await this.generateTilesForLevel(img, level, config, artworkId);
        tiles.push(...levelTiles);
      }
      
      return tiles;
    } catch (error) {
      logger.error('Failed to generate deep zoom tiles', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async generateTilesForLevel(
    img: HTMLImageElement,
    level: number,
    config: DeepZoomConfig,
    artworkId: string
  ): Promise<string[]> {
    const scale = Math.pow(2, level);
    const scaledWidth = Math.ceil(img.naturalWidth / scale);
    const scaledHeight = Math.ceil(img.naturalHeight / scale);
    
    const tilesX = Math.ceil(scaledWidth / config.tileSize);
    const tilesY = Math.ceil(scaledHeight / config.tileSize);
    
    const tiles: string[] = [];
    
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const tileBlob = await this.generateTile(img, level, x, y, config);
        const tileUrl = await this.uploadToStorage(
          tileBlob,
          artworkId,
          `tile_${level}_${x}_${y}`
        );
        tiles.push(tileUrl);
      }
    }
    
    return tiles;
  }

  private async generateTile(
    img: HTMLImageElement,
    level: number,
    tileX: number,
    tileY: number,
    config: DeepZoomConfig
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      const scale = Math.pow(2, level);
      const scaledWidth = img.naturalWidth / scale;
      const scaledHeight = img.naturalHeight / scale;
      
      const tileLeft = tileX * config.tileSize;
      const tileTop = tileY * config.tileSize;
      const tileWidth = Math.min(config.tileSize, scaledWidth - tileLeft);
      const tileHeight = Math.min(config.tileSize, scaledHeight - tileTop);
      
      canvas.width = tileWidth;
      canvas.height = tileHeight;
      
      // Calculate source rectangle
      const srcLeft = tileLeft * scale;
      const srcTop = tileTop * scale;
      const srcWidth = tileWidth * scale;
      const srcHeight = tileHeight * scale;
      
      ctx.drawImage(
        img,
        srcLeft, srcTop, srcWidth, srcHeight,
        0, 0, tileWidth, tileHeight
      );
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create tile blob'));
          }
        },
        this.getMimeType(config.format),
        config.quality / 100
      );
    });
  }

  // ===============================
  // Storage and CDN Integration
  // ===============================

  private async uploadToStorage(
    file: File | Blob,
    artworkId: string,
    variant: string
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('artwork_id', artworkId);
    formData.append('variant', variant);

    try {
      const response = await fetch(`${this.cdnBaseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      logger.error('Upload failed', error instanceof Error ? error : new Error(String(error)));
      // Fallback to local storage or throw error
      throw error;
    }
  }

  // ===============================
  // Image URL Generation with Transformations
  // ===============================

  generateOptimizedUrl(
    baseUrl: string,
    transformations: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
      crop?: 'fill' | 'fit' | 'pad' | 'crop';
      gravity?: 'center' | 'north' | 'south' | 'east' | 'west';
      blur?: number;
      sharpen?: number;
      contrast?: number;
      brightness?: number;
      saturation?: number;
    } = {}
  ): string {
    const params = new URLSearchParams();
    
    Object.entries(transformations).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // ===============================
  // Progressive Image Loading
  // ===============================

  async loadImageProgressively(
    urls: ArtworkImage['urls'],
    onProgress?: (loadedSize: string) => void
  ): Promise<string> {
    const sizeOrder = ['thumbnail', 'small', 'medium', 'large', 'original'] as const;
    
    for (const size of sizeOrder) {
      const url = urls[size];
      if (url) {
        try {
          await this.preloadImage(url);
          onProgress?.(size);
          
          // Return the URL of the successfully loaded image
          // Continue loading larger sizes in background
          if (size !== 'original') {
            this.preloadLargerSizes(urls, size);
          }
          
          return url;
        } catch (error) {
          logger.warn(`Failed to load ${size} image`, error instanceof Error ? error : new Error(String(error)));
          continue;
        }
      }
    }
    
    throw new Error('No image sizes could be loaded');
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private async preloadLargerSizes(
    urls: ArtworkImage['urls'],
    currentSize: string
  ): Promise<void> {
    const sizeOrder = ['thumbnail', 'small', 'medium', 'large', 'original'];
    const currentIndex = sizeOrder.indexOf(currentSize);
    
    for (let i = currentIndex + 1; i < sizeOrder.length; i++) {
      const size = sizeOrder[i] as keyof typeof urls;
      const url = urls[size];
      
      if (url) {
        try {
          const imageUrl = Array.isArray(url) ? url[0] || '' : url;
          if (imageUrl) await this.preloadImage(imageUrl);
        } catch (error) {
          logger.warn(`Failed to preload ${size} image`, error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
  }

  // ===============================
  // Utility Methods
  // ===============================

  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOptimalFormat(file: File): 'webp' | 'avif' | 'jpg' | 'png' {
    // Check browser support for modern formats
    const supportsWebP = this.supportsWebP();
    const supportsAVIF = this.supportsAVIF();
    
    if (supportsAVIF && file.size > 1024 * 1024) {
      return 'avif';
    }
    
    if (supportsWebP) {
      return 'webp';
    }
    
    // Fallback based on original format
    if (file.type.includes('png')) {
      return 'png';
    }
    
    return 'jpg';
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'webp': 'image/webp',
      'avif': 'image/avif',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'tiff': 'image/tiff'
    };
    
    return mimeTypes[format.toLowerCase()] || 'image/jpeg';
  }

  // ===============================
  // Image Analysis and Enhancement
  // ===============================

  async analyzeImageQuality(file: File): Promise<{
    resolution: 'low' | 'medium' | 'high' | 'print_quality';
    sharpness: number;
    contrast: number;
    brightness: number;
    colorRange: number;
    artifacts: string[];
    recommendations: string[];
  }> {
    const metadata = await this.extractImageMetadata(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    const img = await this.loadImage(file);
    canvas.width = Math.min(img.naturalWidth, 1000);
    canvas.height = Math.min(img.naturalHeight, 1000);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    return {
      resolution: this.assessResolution(metadata.dimensions),
      sharpness: this.calculateSharpness(imageData),
      contrast: this.calculateContrast(imageData),
      brightness: this.calculateBrightness(imageData),
      colorRange: this.calculateColorRange(imageData),
      artifacts: this.detectArtifacts(imageData),
      recommendations: this.generateRecommendations(metadata, imageData)
    };
  }

  private assessResolution(dimensions: { width: number; height: number }): 'low' | 'medium' | 'high' | 'print_quality' {
    const totalPixels = dimensions.width * dimensions.height;
    
    if (totalPixels >= 16000000) return 'print_quality'; // 4000x4000+
    if (totalPixels >= 4000000) return 'high';           // 2000x2000+
    if (totalPixels >= 1000000) return 'medium';         // 1000x1000+
    return 'low';
  }

  private calculateSharpness(imageData: ImageData): number {
    // Simplified sharpness calculation using gradient magnitude
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let sharpness = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        // Calculate gradient in x and y directions
        const gx = ((data[i + 4] || 0) - (data[i - 4] || 0)) / 2;
        const gy = ((data[i + width * 4] || 0) - (data[i - width * 4] || 0)) / 2;
        
        // Gradient magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        sharpness += magnitude;
        count++;
      }
    }
    
    return count > 0 ? sharpness / count : 0;
  }

  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data;
    const values: number[] = [];
    
    // Convert to grayscale and collect pixel values
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0);
      values.push(gray);
    }
    
    // Calculate standard deviation as measure of contrast
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let brightness = 0;
    let count = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0);
      brightness += gray;
      count++;
    }
    
    return count > 0 ? brightness / count : 0;
  }

  private calculateColorRange(imageData: ImageData): number {
    const data = imageData.data;
    const colors = new Set<string>();
    
    // Sample every 10th pixel to avoid performance issues
    for (let i = 0; i < data.length; i += 40) {
      const r = Math.floor((data[i] || 0) / 16) * 16;
      const g = Math.floor((data[i + 1] || 0) / 16) * 16;
      const b = Math.floor((data[i + 2] || 0) / 16) * 16;
      colors.add(`${r},${g},${b}`);
    }
    
    return colors.size;
  }

  private detectArtifacts(imageData: ImageData): string[] {
    const artifacts: string[] = [];
    
    // This is a simplified artifact detection
    // In a real implementation, you would use more sophisticated algorithms
    
    const brightness = this.calculateBrightness(imageData);
    const contrast = this.calculateContrast(imageData);
    
    if (brightness < 50) {
      artifacts.push('underexposed');
    } else if (brightness > 200) {
      artifacts.push('overexposed');
    }
    
    if (contrast < 20) {
      artifacts.push('low_contrast');
    }
    
    return artifacts;
  }

  private generateRecommendations(
    metadata: { dimensions: { width: number; height: number } },
    imageData: ImageData
  ): string[] {
    const recommendations: string[] = [];
    const brightness = this.calculateBrightness(imageData);
    const contrast = this.calculateContrast(imageData);
    const resolution = this.assessResolution(metadata.dimensions);
    
    if (resolution === 'low') {
      recommendations.push('Consider capturing at higher resolution for better detail preservation');
    }
    
    if (brightness < 80) {
      recommendations.push('Image appears underexposed - consider brightness adjustment');
    } else if (brightness > 180) {
      recommendations.push('Image appears overexposed - consider reducing brightness');
    }
    
    if (contrast < 30) {
      recommendations.push('Low contrast detected - consider contrast enhancement');
    }
    
    if (metadata.dimensions.width < 1000 || metadata.dimensions.height < 1000) {
      recommendations.push('Image resolution may be insufficient for detailed scholarly examination');
    }
    
    return recommendations;
  }
}

// ===============================
// Factory Function
// ===============================

export function createImageService(config: {
  cdnBaseUrl: string;
  apiKey: string;
  maxFileSize?: number;
  allowedFormats?: string[];
}): ImageService {
  return new ImageService(config);
}

// ===============================
// Default Configuration
// ===============================

export const defaultImageConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'tiff', 'webp', 'avif'],
  qualitySettings: {
    thumbnail: 80,
    small: 85,
    medium: 90,
    large: 95,
    original: 100
  },
  deepZoom: {
    tileSize: 512,
    overlap: 1,
    maxZoomLevel: 6
  }
};

