import { useState } from "react";
import { Search, Play, MapPin } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const destinations = [
    { name: "To Classroom 404", status: "Very Popular", color: "bg-green-400" },
    { name: "To Classroom 404", status: "Not Popular", color: "bg-yellow-400" },
    { name: "To Classroom 404", status: "Least Visited", color: "bg-red-400" }
  ];

  const quickLocations = ["Restroom", "Reception", "Exit", "Nurse Office"];

  const handleSelection = (name: string) => {
    setSearchQuery(name);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <div className="flex items-center bg-white p-3 rounded-full shadow-md mb-4">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="flex-grow px-3 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-green-500 text-white p-2 rounded-full">
          <Play />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        {destinations.map((dest, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b py-3 last:border-none cursor-pointer"
            onClick={() => handleSelection(dest.name)}
          >
            <span>{dest.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${dest.color}`}>
              {dest.status}
            </span>
          </div>
        ))}
      </div>
      <div className="fixed bottom-4 left-4 right-4 flex gap-2 bg-white p-3 rounded-full shadow-lg justify-center">
        {quickLocations.map((location, index) => (
          <button
            key={index}
            className="flex items-center gap-1 p-2 bg-gray-200 rounded-full"
            onClick={() => handleSelection(location)}
          >
            <MapPin /> {location}
          </button>
        ))}
      </div>
    </div>
  );
}
