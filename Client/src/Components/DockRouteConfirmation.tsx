import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Clock, Footprints } from 'lucide-react';

export interface DockRouteConfirmationProps {
  destination: {
    name: string;
    description?: string;
    category?: string;
  };
  steps: number;
  time: string;
  onStartRoute: () => void;
  onCancel: () => void;
}

export const DockRouteConfirmation: React.FC<DockRouteConfirmationProps> = ({
  destination,
  steps,
  time,
  onStartRoute,
  onCancel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const handleDrag = (_: any, info: PanInfo) => {
    // More sensitive drag for snappier response
    if (info.offset.y < -15 && !isExpanded) {
      setIsExpanded(true);
    } else if (info.offset.y > 15 && isExpanded) {
      setIsExpanded(false);
    }
  };

  // Faster snappier transitions
  // Very fast fade transitions
  const quickFade = { 
    type: "tween", 
    duration: 0.15
  };

  // Button padding needs to use actual strings rather than template literals for Tailwind
  const buttonPadding = "py-2.5";
  const containerPadding = "p-3";

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[999]" ref={containerRef}>
      <motion.div 
        className="flex flex-col bg-white backdrop-blur-sm w-full max-w-md rounded-t-lg shadow-xl pb-4 z-[999] overflow-hidden"
        initial={{ y: 50 }}
        animate={{ 
          y: 0,
          transition: { duration: 0.2 }
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDrag={handleDrag}
        dragElastic={0.03} // Even less elasticity for snappier feel
        style={{ y, originY: 1, willChange: "transform" }}
        dragDirectionLock
        dragMomentum={false}
        dragTransition={{ power: 0.2, timeConstant: 50 }}
      >
        {/* Drag handle indicator */}
        <div className="w-full flex justify-center py-1.5 cursor-grab active:cursor-grabbing touch-none">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="border-b border-gray-100">
          {/* Header row with title */}
          <div className="flex items-start justify-between p-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-green-600" size={isExpanded ? 22 : 18} />
              <div className="flex flex-col">
                <h2 
                  className="font-semibold text-green-800 truncate"
                  style={{ fontSize: isExpanded ? '1.25rem' : '1.125rem' }}
                >
                  {destination.name}
                </h2>
                
                {destination.category && (
                  <span className="text-xs text-green-800 opacity-75 block">
                    {destination.category}
                  </span>
                )}
              </div>
            </div>
            
            {/* Chips for steps and time - horizontal in collapsed mode */}
            <AnimatePresence mode="wait" initial={false}>
              {!isExpanded ? (
                <motion.div 
                  key="chips" 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={quickFade}
                >
                  <div className="flex items-center gap-1 bg-green-50 px-3 py-2 rounded-full">
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 8.97552H3.75V9.60052C3.75 10.3599 3.13439 10.9755 2.375 10.9755C1.61561 10.9755 1 10.3599 1 9.60052V8.97552ZM3 3.0358C4 3.0358 4.5 4.4755 4.5 5.47552C4.5 5.97552 4.25 6.47552 4 7.22552L3.75 7.97552H1C1 7.47552 0.75 6.72552 0.75 5.47552C0.75 4.2255 1.74891 3.0358 3 3.0358ZM9.027 7.02467L8.91845 7.64017C8.7866 8.38802 8.0734 8.88737 7.32555 8.75552C6.5777 8.62367 6.07835 7.91047 6.21025 7.16262L6.31875 6.54712L9.027 7.02467ZM8.0888 0.827906C9.32085 1.04516 10.098 2.39024 9.88095 3.62125C9.6639 4.85226 9.28745 5.54747 9.20065 6.03987L6.4924 5.56232L6.37645 4.7803C6.26045 3.99829 6.1011 3.46247 6.1879 2.97007C6.36155 1.98526 7.10395 0.654261 8.0888 0.827906Z" fill="black"/>
                    </svg>

                    <span className="text-xs font-medium">{steps} steps</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-green-50 px-3 py-2 rounded-full">
                    <Clock size={14} />
                    <span className="text-xs font-medium">{ time } {time == "1" ? "minute" : "minutes"}</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          
          {/* Steps and time - vertical in expanded mode */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                className="px-3 pb-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={quickFade}
              >
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg flex-1">
                    <div className="bg-black/5 p-1.5 rounded-full">
                      <Footprints size={18} />
                    </div>
                    <div>
                      <div className="font-medium ">{steps}</div>
                      <div className="text-xs ">steps</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg flex-1">
                    <div className="bg-black/5 p-1.5 rounded-full">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="font-medium ">{time}</div>
                      <div className="text-xs ">min</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Description with conditional rendering */}
        <AnimatePresence initial={false}>
          {isExpanded && destination.description && (
            <motion.div 
              key="description"
              className="bg-white/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={quickFade}
            >
              <p className="text-base text-gray-600 p-4">
                {destination.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action buttons - fixed at bottom */}
        <div className="bg-white/90 border-t border-gray-100">
          <div className={containerPadding + " flex gap-2 w-full"}>
            <button
              onClick={onCancel}
              className={`flex-1 ${buttonPadding} border bg-[#FF000040] border-[#FF000040] rounded-lg text-gray-700 font-medium hover:bg-[#FF000060] active:bg-[#FF000080] active:scale-[0.98] transition-all duration-150`}
            >
              Cancel
            </button>
            <button
              onClick={onStartRoute}
              className={`flex-1 ${buttonPadding} bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-green-600 active:bg-green-700 active:scale-[0.98] transition-all duration-150`}
            >
              Start <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
