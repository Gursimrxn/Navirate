import { useState } from "react";

export default function Navirate() {
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [selectedEnd, setSelectedEnd] = useState("📍 Choose Destination");
  const [currentLocation, setCurrentLocation] = useState("📍 Choose Start Point");

  const options = [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6"
  ];

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation("Location access denied");
        }
      );
    } else {
      setCurrentLocation("Geolocation not supported");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-green-100 relative overflow-hidden w-full mx-auto p-4">
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="grid grid-cols-3 gap-4 w-full h-full opacity-30">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white w-24 h-24 transform rotate-45 rounded-lg"
            />
          ))}
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center p-6 bg-transparent shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold">Let's Guide <br /> You're Way In!</h1>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center p-4 bg-white shadow-lg rounded-lg w-full max-w-sm bottom-4">
        <button
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg shadow"
          onClick={getLocation}
        >
          {currentLocation}
        </button>
        <button
          className="w-full mt-2 py-2 px-4 bg-gray-200 rounded-lg shadow"
          onClick={() => setShowEndOptions(!showEndOptions)}
        >
          {selectedEnd}
        </button>
        {showEndOptions && (
          <ul className="w-full mt-2 bg-white shadow-md rounded-lg">
            {options.map((option, index) => (
              <li
                key={index}
                className="py-2 px-4 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setSelectedEnd(option);
                  setShowEndOptions(false);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-500 mt-2">
          *We need location access to get your current location
        </p>
      </div>
    </div>
  );
}
