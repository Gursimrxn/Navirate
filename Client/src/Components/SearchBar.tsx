import { motion } from "framer-motion";
import { Search, Play, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { navigationService, Destination } from "../services/navigationService";
import { navigationEvents } from "../services/eventService";
import { RouteConfirmation } from "./RouteConfirmation";

interface SearchBarProps {
  onClose: () => void;
  startId: string;
  endId: string;
  setStartId: (id: string) => void;
  setEndId: (id: string) => void;
  onCalculateRoute: () => void;
  isAnimating: boolean;
}

// UI mapping type definition
interface DestinationUI {
  icon: string;
  status: string;
  color: string;
}

// Helper function to map destination categories to UI elements
const getCategoryUI = (category: string): DestinationUI => {
  switch (category.toLowerCase()) {
    case 'facilities':
      return { icon: "🚽", status: "Available", color: "bg-green-400" };
    case 'common':
      return { icon: "🏢", status: "Open", color: "bg-green-400" };
    case 'exit':
      return { icon: "🚪", status: "Available", color: "bg-green-400" };
    case 'medical':
      return { icon: "🏥", status: "Available", color: "bg-green-400" };
    default:
      return { icon: "📍", status: "Available", color: "bg-blue-400" };
  }
};

const SearchBar = ({
  onClose,
  startId,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [destinations, setDestinations] = useState<(Destination & DestinationUI)[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{steps: number, time: string}>({
    steps: 0, 
    time: "0"
  });

  // Fetch destinations when component mounts
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const destinationsData = await navigationService.getDestinations();
        // Map API data to include UI properties
        const mappedDestinations = destinationsData.map(dest => ({
          ...dest,
          ...getCategoryUI(dest.category)
        }));
        setDestinations(mappedDestinations);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleNavigation = async (destinationId: string) => {
    try {
      if (navigationService.isNavigating) {
        return;
      }

      navigationService.isNavigating = true;
      await navigationEvents.emit(startId, destinationId);
      onClose();
    } catch (error) {
      console.error("Navigation failed:", error);
      navigationService.cancelNavigation();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Find matching destination
    const destination = destinations.find(
      dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (destination) {
      setSelectedDestination(destination);
      setShowConfirmation(true);
    } else {
      // Could show a "no results found" message here
      console.log("No matching destination found");
    }
  };

  const handleStartRoute = () => {
    if (selectedDestination) {
      handleNavigation(selectedDestination.id);
    }
  };

  // Calculate route information when a destination is selected
  const handleSelectDestination = async (destination: Destination & DestinationUI) => {
    setSelectedDestination(destination);
    
    try {
      // Get estimated route info before showing confirmation
      // This pre-calculates the route to get steps and time info
      const routeEstimation = await navigationService.estimateRouteInfo(startId, destination.id);
      
      setRouteInfo({
        steps: routeEstimation.steps || Math.floor(Math.random() * 10) + 10, // Fallback to random number between 10-20
        time: routeEstimation.time || Math.ceil(Math.random() * 3).toString() // Fallback to random number between 1-3
      });
    } catch (error) {
      console.error("Failed to estimate route:", error);
      // Fallback values if estimation fails
      setRouteInfo({
        steps: Math.floor(Math.random() * 10) + 10,
        time: Math.ceil(Math.random() * 3).toString()
      });
    }
    
    setShowConfirmation(true);
  };

  if (showConfirmation && selectedDestination) {
    return (
      <RouteConfirmation
        destination={selectedDestination.name}
        steps={routeInfo.steps}
        time={routeInfo.time}
        onStartRoute={handleStartRoute}
        onDiscard={() => setShowConfirmation(false)}
      />
    );
  }

  // Filter destinations based on search query
  const filteredDestinations = searchQuery.trim() ? 
    destinations.filter(dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : destinations;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 bg-white min-h-screen z-50"
    >
      <div className="max-w-xl mx-auto p-4">
        {/* Back button */}

        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Close search"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center bg-gray-100 p-3 rounded-full shadow-md mb-4 mt-12">
          <Search className="text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search destination..."
            className="flex-grow px-3 bg-transparent focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button 
            onClick={handleSearch} 
            className="bg-green-500 px-3 py-1 rounded-full text-white"
          >
            <Play size={16} />
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-md p-4">
          {isLoading ? (
            <div className="py-3 text-center text-gray-500">Loading destinations...</div>
          ) : filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center border-b border-gray-200 py-3 last:border-none cursor-pointer"
                onClick={() => handleSelectDestination(dest)}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
              >
                <div className="flex items-center gap-2">
                  <span>{dest.icon}</span>
                  <span>{dest.name}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${dest.color}`}>
                  {dest.status}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="py-3 text-center text-gray-500">
              {searchQuery ? "No matching destinations found" : "No destinations available"}
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-4 right-4 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-lg shadow-lg">
            {destinations.slice(0, 4).map((dest) => (
              <motion.button
                key={dest.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={() => handleSelectDestination(dest)}
              >
                <span>{dest.icon}</span>
                <span>{dest.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
