import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { navigationService, Destination } from "../services/navigationService";
import { navigationEvents } from "../services/eventService";

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
  const [destinations, setDestinations] = useState<(Destination & DestinationUI)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Directly navigate instead of showing confirmation
      handleNavigation(destination.id);
    } else {
      // Could show a "no results found" message here
      console.log("No matching destination found");
    }
  };

  // Calculate route information and directly navigate
  const handleSelectDestination = async (destination: Destination & DestinationUI) => {
    try {
      handleNavigation(destination.id);
    } catch (error) {
      console.error("Failed to estimate route:", error);
      handleNavigation(destination.id);
    }
  };

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
            className="bg-green-500 p-2 rounded-full text-white"
          >
            <svg width="16" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.333333 0.896973C0.3895 0.896973 0.44476 0.911166 0.493973 0.938233L12.8023 7.70779C12.9636 7.79652 13.0225 7.99919 12.9337 8.16052C12.9033 8.21592 12.8577 8.26152 12.8023 8.29199L0.493973 15.0615C0.332667 15.1503 0.12998 15.0914 0.0412599 14.9301C0.0141933 14.8809 0 14.8257 0 14.7695V1.23031C0 1.04621 0.14924 0.896973 0.333333 0.896973ZM1.33333 2.92158V7.33319H4.66667V8.66652H1.33333V13.0782L10.5666 7.99985L1.33333 2.92158Z" fill="white"/>
            </svg>
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
