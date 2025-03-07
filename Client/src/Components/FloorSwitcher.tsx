import React from 'react';
import { motion } from 'framer-motion';

interface FloorSwitcherProps {
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
  className?: string;
}

export const FloorSwitcher: React.FC<FloorSwitcherProps> = ({ 
  currentFloor, 
  setCurrentFloor,
  className = ''
}) => {
  const floors = ['2', '1', 'G']; // Add all floors your building has

  return (
    <div className={`flex flex-col bg-white rounded-full p-1 gap-2 shadow-lg z-50 ${className}`}>
      {floors.map((floor) => (
        <motion.button
          key={floor}
          onClick={() => setCurrentFloor(floor)}
          className={`p-3 w-12 h-12 flex items-center justify-center rounded-full bg-[#30A9531A] 
            ${currentFloor === floor ? 'bg-green-500 text-white font-bold' : ' hover:bg-gray-100'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {floor}
        </motion.button>
      ))}
    </div>
  );
};
