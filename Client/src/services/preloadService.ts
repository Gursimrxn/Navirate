import { navigationService } from './navigationService';

// Centralized preloading service to load all required data before showing the app
export class PreloadService {
  private loadedResources: Map<string, any> = new Map();
  private loadingProgress = 0;
  private totalItems = 0;
  private loadedItems = 0;
  
  // Store a callback for progress updates
  private progressCallback: ((progress: number) => void) | null = null;

  constructor() {
    this.totalItems = 3; // Reduced to critical items: building data, destinations, and map style
  }

  // Set progress callback
  public onProgress(callback: (progress: number) => void): void {
    this.progressCallback = callback;
    // Immediately call with current progress
    if (this.loadingProgress > 0) {
      callback(this.loadingProgress);
    }
  }

  // Update progress when an item is loaded
  private updateProgress(): void {
    this.loadedItems++;
    this.loadingProgress = Math.min(95, Math.floor((this.loadedItems / this.totalItems) * 100));
    
    if (this.progressCallback) {
      this.progressCallback(this.loadingProgress);
    }
  }

  // Complete loading (set to 100%)
  private completeProgress(): void {
    this.loadingProgress = 100;
    if (this.progressCallback) {
      this.progressCallback(100);
    }
  }

  // Access a preloaded resource
  public getResource<T>(key: string): T | null {
    return this.loadedResources.get(key) as T || null;
  }

  // Preload all necessary data
  public async preloadAll(): Promise<boolean> {
    try {
      // Set a global timeout to avoid getting stuck in preloading
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Preloading timed out')), 10000); // 10s timeout
      });

      // Start parallel loading of critical resources only
      const loadPromise = Promise.all([
        this.preloadBuildingData(),
        this.preloadDestinations(),
        this.preloadMapStyle(),
      ]);
      
      // Race against timeout
      await Promise.race([
        loadPromise,
        timeoutPromise
      ]);
      
      // Non-critical resources loaded in background
      this.preloadNonCriticalResources();
      
      // Mark as complete
      this.completeProgress();
      return true;
    } catch (error) {
      console.error('Preloading failed:', error);
      // Still mark as complete to prevent blocking the app
      this.completeProgress();
      return true; // Return true anyway to allow app to start
    }
  }

  // Load building geometry data with better error handling
  private async preloadBuildingData(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/Turing2.geojson', { 
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      this.loadedResources.set('buildingData', data);
      this.updateProgress();
    } catch (error) {
      console.warn('Building data preload issue:', error instanceof Error ? error.message : 'Unknown error');
      this.updateProgress();
    }
  }

  // Load destinations data with better error handling
  private async preloadDestinations(): Promise<void> {
    try {
      const destinations = await navigationService.getDestinations();
      this.loadedResources.set('destinations', destinations);
      this.updateProgress();
    } catch (error) {
      console.warn('Destinations preload issue:', error instanceof Error ? error.message : 'Unknown error');
      this.updateProgress();
    }
  }

  // Preload map style - simplified to reduce errors
  private async preloadMapStyle(): Promise<void> {
    try {
      // Simplified approach: just preload the mapbox script but don't initialize map
      await import('mapbox-gl');
      this.updateProgress();
    } catch (error) {
      console.warn('Map style preload issue:', error instanceof Error ? error.message : 'Unknown error');
      this.updateProgress();
    }
  }

  // Non-critical resources loaded in background
  private preloadNonCriticalResources(): void {
    // Logo loading
    const img = new Image();
    img.onload = () => {
      this.loadedResources.set('logo', img);
    };
    img.src = '/logo.svg';
    
    // Font loading via CSS - more reliable than JS FontFace API
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

// Export a singleton instance
export const preloadService = new PreloadService();
