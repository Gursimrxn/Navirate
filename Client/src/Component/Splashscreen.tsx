import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for navigation

const SplashScreen = () => {
  const navigate = useNavigate(); // Hook to navigate to another page

  useEffect(() => {
    // After 2 seconds, navigate to the login page
    const timer = setTimeout(() => {
      navigate("/login"); // Adjust the path based on your route configuration
    }, 2000);

    // Clear the timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E0F2E0]">
      <motion.img
        src="/logo.svg"
        alt="Navirate Logo"
        className="h-24 w-auto"
        initial={{ scale: 0 }} // Start with a small scale
        animate={{ scale: 1 }}  // Scale to normal size
        transition={{ duration: 1, ease: "easeOut" }} // 1 second zoom-in effect
      />
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
