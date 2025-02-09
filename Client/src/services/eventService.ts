type NavigationCallback = (startId: string, endId: string) => void;

class NavigationEventService {
    private listeners: NavigationCallback[] = [];

    subscribe(callback: NavigationCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    emit(startId: string, endId: string) {
        this.listeners.forEach(callback => callback(startId, endId));
    }
}

export const navigationEvents = new NavigationEventService();
