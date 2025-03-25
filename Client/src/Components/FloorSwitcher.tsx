import React from 'react';
import { motion } from 'framer-motion';

interface FloorSwitcherProps {
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
  className?: string;
  isHidden?: boolean; // New prop to control visibility
}

export const FloorSwitcher: React.FC<FloorSwitcherProps> = ({ 
  currentFloor, 
  setCurrentFloor,
  className = '',
  isHidden = false // Default to visible
}) => {
  const floors = ['2', '1', 'G']; // Add all floors your building has

  // If hidden, don't render at all
  if (isHidden) {
    return null;
  }

  return (
    <motion.div 
      className={`flex flex-col rounded-full border-2 p-1 gap-2 shadow-lg z-20 ${className}`}
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border-color)',
      }}
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isHidden ? 0 : 1,
        scale: isHidden ? 0.8 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {floors.map((floor) => (
        <motion.button
          key={floor}
          onClick={() => setCurrentFloor(floor)}
          className={`p-3 w-11 h-11 flex items-center justify-center rounded-full`}
          style={{
            backgroundColor: currentFloor === floor 
              ? 'var(--primary-color)' 
              : 'var(--secondary-background)',
            color: currentFloor === floor 
              ? 'var(--primary-foreground)' 
              : 'var(--foreground)',
            fontWeight: currentFloor === floor ? 'bold' : 'normal'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {floor}
        </motion.button>
      ))}
    </motion.div>
  );
};
