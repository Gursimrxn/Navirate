import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for navigation
import ShinyText from "./ShinyText";

const SplashScreen = () => {
  const navigate = useNavigate(); // Hook to navigate to another page

  useEffect(() => {
    // After 2 seconds, navigate to the login page
    const timer = setTimeout(() => {
      navigate("/"); // Adjust the path based on your route configuration
    }, 2000);

    // Clear the timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#E0F2E0]">
      <motion.img
        src="/logo.svg"
        alt="Navirate Logo"
        className="min-h-20 w-auto"
        initial={{ scale: 0.3 }} // Start with a small scale
        animate={{ scale: 0.32 }}  // Scale to normal size
        transition={{ duration: 2, ease: "anticipate" }} // 1 second zoom-in effect
      />
      <ShinyText text="Loading..." speed={2} className="animate-shine">

      </ShinyText>
      {/* Small Loader Filler at Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="h-1 bg-green-500 rounded-full"
          style={{ width: "80px" }} 
          initial={{ width: 0 }}
          animate={{ width: "80px" }}
          transition={{ duration: 2, ease: "linear" }}
        />
      </div>
    </div>
  );
};

const Auth = () => {
  return (
    <div>
      <SplashScreen />
      {/* Login page will be displayed after splash screen */}
    </div>
  );
};

export default Auth;
