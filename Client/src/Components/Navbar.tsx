import { motion } from "framer-motion";
import { navigationService, Destination } from "../services/navigationService.ts";
import { navigationEvents } from "../services/eventService";
import { useState, useEffect, ReactElement } from "react";

// We'll keep the icons for now, but in a production app these would be stored in the backend
const getIconForDestination = (name: string): ReactElement => {
  switch (name) {
    case "Restroom":
      return (
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_321_2061)">
            <path
              d="M8.00559 2.79627L4.83051 5.97135C3.07696 7.72487 3.07696 10.568 4.83051 12.3215C6.58406 14.075 9.42714 14.075 11.1806 12.3215C12.9342 10.568 12.9342 7.72487 11.1806 5.97135L8.00559 2.79627ZM8.00559 0.981934L12.0879 5.06418C14.3424 7.31876 14.3424 10.9741 12.0879 13.2287C9.83325 15.4832 6.17791 15.4832 3.92335 13.2287C1.66878 10.9741 1.66878 7.31876 3.92335 5.06418L8.00559 0.981934Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_321_2061">
              <rect width="15.3951" height="15.3951" fill="white" transform="translate(0.306641 0.80957)" />
            </clipPath>
          </defs>
        </svg>
      );
    case "Reception":
      return (
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.3281 2.73389H6.47936V4.01681H7.76229V4.68995C4.52077 5.01179 1.98912 7.74673 1.98912 11.0729V11.7144H14.8184V11.0729C14.8184 7.74673 12.2867 5.01179 9.04522 4.68995V4.01681H10.3281V2.73389ZM8.40375 5.9412C11.0207 5.9412 13.1801 7.90004 13.4958 10.4314H3.31175C3.62741 7.90004 5.78683 5.9412 8.40375 5.9412ZM15.4599 13.6388V12.3558H1.34766V13.6388H15.4599Z"
            fill="black"
          />
        </svg>
      );
    case "Exit":
      return (
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_321_2073)">
            <path
              d="M5.4131 13.6386V9.78985H10.5448V13.6386H12.4692V3.37521H3.48871V13.6386H5.4131ZM6.69602 13.6386H9.26188V11.0728H6.69602V13.6386ZM13.7521 13.6386H15.035V14.9216H0.922852V13.6386H2.20578V2.73375C2.20578 2.37948 2.49297 2.09229 2.84724 2.09229H13.1107C13.4649 2.09229 13.7521 2.37948 13.7521 2.73375V13.6386ZM7.33749 5.94107V4.65814H8.62041V5.94107H9.90334V7.22399H8.62041V8.50692H7.33749V7.22399H6.05456V5.94107H7.33749Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_321_2073">
              <rect width="15.3951" height="15.3951" fill="white" transform="translate(0.28418 0.80957)" />
            </clipPath>
          </defs>
        </svg>
      );
    case "Nurse Office":
      return (
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_321_2073)">
            <path
              d="M5.4131 13.6386V9.78985H10.5448V13.6386H12.4692V3.37521H3.48871V13.6386H5.4131ZM6.69602 13.6386H9.26188V11.0728H6.69602V13.6386ZM13.7521 13.6386H15.035V14.9216H0.922852V13.6386H2.20578V2.73375C2.20578 2.37948 2.49297 2.09229 2.84724 2.09229H13.1107C13.4649 2.09229 13.7521 2.37948 13.7521 2.73375V13.6386ZM7.33749 5.94107V4.65814H8.62041V5.94107H9.90334V7.22399H8.62041V8.50692H7.33749V7.22399H6.05456V5.94107H7.33749Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_321_2073)">
              <rect width="15.3951" height="15.3951" fill="white" transform="translate(0.28418 0.80957)" />
            </clipPath>
          </defs>
        </svg>
      );
    default:
      return (
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8.5" r="7" stroke="black" strokeWidth="1.5" />
        </svg>
      );
  }
};

export const Navbar = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [navigationMessage, setNavigationMessage] = useState("Continue 12 feet");
  // Always default to building entry
  const currentLocation = "5";
  const [isLoading, setIsLoading] = useState(true);

  // Fetch destinations from API on component mount
  useEffect(() => {
    const loadDestinations = async () => {
      setIsLoading(true);
      try {
        const data = await navigationService.getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error("Failed to load destinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Subscribe to navigation status changes
  useEffect(() => {
    // Subscribe to navigation status events
    const unsubscribe = navigationEvents.subscribeToStatus((status, message) => {
      switch (status) {
        case "started":
          setIsNavigating(true);
          setNavigationMessage("Starting navigation...");
          break;
        case "completed":
          setIsNavigating(false);
          break;
        case "cancelled":
          setIsNavigating(false);
          break;
        case "failed":
          setIsNavigating(false);
          setNavigationMessage(message || "Navigation failed");
          // Could show an error toast or message here
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNavigationRequest = (destination: Destination | "Emergency") => {
    try {
      if (navigationService.isNavigating) return; // Prevent multiple navigation requests
      
      // Use building entry (5) as the default starting point
      const startPoint = currentLocation || "5"; 
      
      if (destination === "Emergency") {
        navigationEvents.emit(startPoint, { type: "emergency" });
        return;
      }
      
      // Use the actual destination ID from API data
      navigationEvents.emit(startPoint, destination.id);
    } catch (error) {
      console.error("Navigation request failed:", error);
    }
  };

  const handleCancelNavigation = () => {
    navigationService.cancelNavigation();
  };

  return (
    <div className="fixed z-20 mt-12 w-full">
      <motion.div
        className="max-w-xl w-[95%] flex justify-between mx-auto rounded-full shadow-2xl px-3 p-2 bg-white"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {isNavigating ? (
          <motion.div 
            className="flex items-center gap-2 justify-between w-full" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            key="navigating">
            <div className="flex items-center gap-2">
              <motion.div className="flex items-center justify-center transition-colors ease rounded-full py-2.5 px-2.5">
                <svg width="24" height="24" fill="none">
                  <path d="M2 12h16M14 10l4 2-4 2" stroke="green" strokeWidth="2" />
                </svg>
              </motion.div>
              <span className="text-base">{navigationMessage}</span>
            </div>
            <button 
              onClick={handleCancelNavigation}
              className="bg-red-50 hover:bg-red-100 text-red-700 rounded-full py-1.5 px-3 text-sm font-medium">
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="destinations">
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading destinations...</span>
              </div>
            ) : (
              destinations.map((dest) => (
                <motion.div
                  key={dest.id}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center justify-center transition-colors ease rounded-full py-2 px-2 gap-1 cursor-pointer hover:bg-black/15 flex-shrink-0"
                  onClick={() => handleNavigationRequest(dest)}
                >
                  {getIconForDestination(dest.name)}
                  <span className="font-satoshi text-base font-normal max-w-[90px] truncate">{dest.name}</span>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
        <motion.div
          onClick={() => handleNavigationRequest("Emergency")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="flex justify-center items-center bg-gradient-to-r from-[#FFC9C980] to-[#FFC9C9] w-[45px] h-[45px] rounded-full cursor-pointer flex-shrink-0"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.2759 11.4187L10.0815 12.2173V16.4674H7.68317V10.5314H7.70118L14.019 8.23196C14.3116 8.11933 14.6291 8.06305 14.956 8.07406C16.2888 8.10683 17.4592 8.9805 17.8663 10.2561C18.0897 10.9563 18.2936 11.4289 18.4777 11.6737C19.5717 13.1283 21.3123 14.069 23.2726 14.069V16.4674C20.6648 16.4674 18.3347 15.2782 16.7951 13.4126L16.0979 17.3664L18.4759 19.6692V28.4593H16.0775V21.2812L13.62 18.8983L12.4835 24.0526L4.2168 22.595L4.63326 20.233L10.5381 21.2742L12.2759 11.4187ZM16.6771 7.47351C15.3525 7.47351 14.2787 6.39972 14.2787 5.07513C14.2787 3.75055 15.3525 2.67676 16.6771 2.67676C18.0017 2.67676 19.0755 3.75055 19.0755 5.07513C19.0755 6.39972 18.0017 7.47351 16.6771 7.47351Z" fill="#FF0000"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};