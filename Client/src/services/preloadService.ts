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
    this.totalItems = 5; // Total number of items to load: building data, destinations, images, font, map style
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
      // Start parallel loading of different resources
      const promises = [
        this.preloadBuildingData(),
        this.preloadDestinations(),
        this.preloadLogo(),
        this.preloadFonts(),
        this.preloadMapStyle(),
      ];
      
      // Wait for all resources to load
      await Promise.all(promises);
      
      // Mark as complete
      this.completeProgress();
      return true;
    } catch (error) {
      console.error('Preloading failed:', error);
      return false;
    }
  }

  // Load building geometry data
  private async preloadBuildingData(): Promise<void> {
    try {
      const response = await fetch('/test3.geojson');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      this.loadedResources.set('buildingData', data);
      this.updateProgress();
    } catch (error) {
      console.error('Failed to preload building data:', error);
      this.updateProgress(); // Still update progress even on failure
    }
  }

  // Load destinations data
  private async preloadDestinations(): Promise<void> {
    try {
      const destinations = await navigationService.getDestinations();
      this.loadedResources.set('destinations', destinations);
      this.updateProgress();
    } catch (error) {
      console.error('Failed to preload destinations:', error);
      this.updateProgress();
    }
  }

  // Preload the logo image
  private async preloadLogo(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.loadedResources.set('logo', img);
        this.updateProgress();
        resolve();
      };
      img.onerror = () => {
        console.error('Failed to preload logo');
        this.updateProgress();
        resolve();
      };
      img.src = '/logo.svg';
    });
  }

  // Preload essential fonts
  private async preloadFonts(): Promise<void> {
    try {
      // Use FontFace API if available
      if ('FontFace' in window) {
        const font = new FontFace(
          'Inter', 
          'url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)'
        );
        await font.load();
        document.fonts.add(font);
      }
      this.updateProgress();
    } catch (error) {
      console.error('Failed to preload fonts:', error);
      this.updateProgress();
    }
  }

  // Preload map style
  private async preloadMapStyle(): Promise<void> {
    try {
      // Mapbox style is preloaded by creating a hidden 1x1px map instance
      // This forces the style to be fetched and cached
      const MAP_STYLE = "mapbox://styles/mapbox/standard";
      const preloadContainer = document.createElement('div');
      preloadContainer.style.width = '1px';
      preloadContainer.style.height = '1px';
      preloadContainer.style.position = 'absolute';
      preloadContainer.style.visibility = 'hidden';
      document.body.appendChild(preloadContainer);
      
      // Create tiny map to preload style
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      const mapInstance = new mapboxgl.Map({
        container: preloadContainer,
        style: MAP_STYLE,
        center: [0, 0],
        zoom: 0
      });
      
      // Wait for style to load
      await new Promise<void>(resolve => {
        mapInstance.on('styledata', () => {
          // Remove preload container
          mapInstance.remove();
          document.body.removeChild(preloadContainer);
          resolve();
        });
      });
      
      this.updateProgress();
    } catch (error) {
      console.error('Failed to preload map style:', error);
      this.updateProgress();
    }
  }
}

// Export a singleton instance
export const preloadService = new PreloadService();
