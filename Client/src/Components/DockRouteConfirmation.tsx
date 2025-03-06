import React from 'react';
import { motion } from 'framer-motion';
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
  return (
      <motion.div 
        className="flex flex-col bg-transparent w-full max-w-md rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Compact header with destination */}
        <div className="bg-green-50 p-3 border-b border-gray-100 rounded-t-lg">
          <div className="flex items-center gap-2">
            <MapPin className="text-green-600" size={18} />
            <h2 className="text-lg font-semibold text-green-800 truncate">{destination.name}</h2>
          </div>
          {destination.category && (
            <span className="text-xs text-green-800 opacity-75 ml-6">{destination.category}</span>
          )}
        </div>
        
        {/* Route stats in a more compact form */}
        <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-white/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-full">
              <Footprints size={16} className="text-blue-500" />
            </div>
            <div>
              <div className="font-medium">{steps}</div>
              <div className="text-xs text-gray-500">steps</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-full">
              <Clock size={16} className="text-blue-500" />
            </div>
            <div>
              <div className="font-medium">{time}</div>
              <div className="text-xs text-gray-500">min</div>
            </div>
          </div>
        </div>
        
        {/* Compact description if available */}
        {destination.description && (
          <div className="px-3 py-2 overflow-auto bg-white/30">
            <p className="text-sm text-gray-600 line-clamp-3">{destination.description}</p>
          </div>
        )}
        
        {/* Action buttons in horizontal layout */}
        <div className="p-3 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            onClick={onStartRoute}
            className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-green-600 transition-colors"
          >
            Start <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
  );
};
