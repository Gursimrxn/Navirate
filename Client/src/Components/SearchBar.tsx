import { motion } from "framer-motion";
import { Search, Play } from "lucide-react";
import { useState } from "react";
import { navigationService } from "../services/navigationService";

interface SearchBarProps {
  onClose: () => void;
  startId: string;
  endId: string;
  setStartId: (id: string) => void;
  setEndId: (id: string) => void;
  onCalculateRoute: () => void;
  isAnimating: boolean;
}

const SearchBar = ({
  onClose,
  startId,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const destinations = [
    { id: "31", name: "Restroom", status: "Available", color: "bg-green-400", icon: "🚽" },
    { id: "26", name: "Reception", status: "Open", color: "bg-green-400", icon: "🏢" },
    { id: "5", name: "Exit", status: "Available", color: "bg-green-400", icon: "🚪" },
    { id: "29", name: "Nurse Office", status: "Available", color: "bg-green-400", icon: "🏥" },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 bg-white min-h-screen z-50"
    >
      <div className="max-w-xl mx-auto p-4">

        <div className="flex items-center bg-gray-100 p-3 rounded-full shadow-md mb-4">
          <Search className="text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search destination..."
            className="flex-grow px-3 bg-transparent focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white p-2 rounded-full"
            onClick={async () => {
              try {
                await navigationService.getPath(startId, searchQuery);
                onClose();
              } catch (error) {
                console.error("Navigation failed:", error);
              }
            }}
          >
            <Play />
          </motion.button>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-md p-4">
          {destinations.map((dest, index) => (
            <motion.div
              key={index}
              className="flex justify-between items-center border-b border-gray-200 py-3 last:border-none cursor-pointer"
              onClick={async () => {
                try {
                  await navigationService.getPath(startId, dest.id);
                  onClose();
                } catch (error) {
                  console.error("Navigation failed:", error);
                }
              }}
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
          ))}
        </div>

        <div className="fixed bottom-4 left-4 right-4 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-lg shadow-lg">
            {destinations.map((dest) => (
              <motion.button
                key={dest.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={async () => {
                  try {
                    await navigationService.getPath(startId, dest.id);
                    onClose();
                  } catch (error) {
                    console.error("Navigation failed:", error);
                  }
                }}
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
