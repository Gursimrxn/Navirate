import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Add an onLoadComplete callback prop and progress props
interface SplashScreenProps {
  onLoadComplete?: () => void;
  progress?: number;
  isLoading: boolean;
}

const SplashScreen = ({ onLoadComplete, progress = 0, isLoading }: SplashScreenProps) => {
  // Track when the animation is complete
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // If both loading and animation are done, trigger the completion callback
  useEffect(() => {
    if (!isLoading && animationComplete && onLoadComplete) {
      // Short delay for a smooth transition
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, animationComplete, onLoadComplete]);

  // Set animation complete after minimum display time
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Helper component for the shiny text effect
  const ShinyText = ({ text, className = "" }: { text: string, className?: string }) => (
    <div className={`text-green-700 font-medium mt-4 text-lg relative overflow-hidden ${className}`}>
      {text}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#E0F2E0]">
      <motion.img
        src="/logo.svg"
        alt="Navirate Logo"
        className="min-h-20 w-auto"
        initial={{ scale: 0.3 }}
        animate={{ scale: 0.32 }}
        transition={{ duration: 1.8, ease: "anticipate" }}
      />
      
      <ShinyText text={isLoading ? `Loading ${progress}%...` : "Ready!"} className="animate-shine" />
      
      {/* Progress bar based on actual loading progress */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[140px] bg-green-200 rounded-full h-1">
        <motion.div
          className="h-1 bg-green-500 rounded-full"
          style={{ width: `${progress}%` }} 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
