import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock, Footprints, MapPin } from 'lucide-react';

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

/**
 * Route confirmation component that shows in the dock
 */
export const DockRouteConfirmation: React.FC<DockRouteConfirmationProps> = ({
  destination,
  steps,
  time,
  onStartRoute,
  onCancel
}) => {
  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold text-center flex-1">Route Preview</h2>
        <div className="w-8"></div> {/* Placeholder for alignment */}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Destination header */}
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
            <MapPin /> {destination.name}
          </h3>
          {destination.category && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
              {destination.category}
            </span>
          )}
        </div>

        {/* Route stats */}
        <div className="flex justify-between mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Footprints size={18} className="text-blue-500" />
            <div>
              <div className="text-lg font-semibold">{steps}</div>
              <div className="text-xs text-gray-500">steps</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            <div>
              <div className="text-lg font-semibold">{time}</div>
              <div className="text-xs text-gray-500">min</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {destination.description && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">About this destination:</h4>
            <p className="text-gray-600">{destination.description}</p>
          </div>
        )}

        {/* Navigation instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">How to get there:</h4>
          <p className="text-gray-600">
            Follow the highlighted path on the map. The path will guide you to your destination.
          </p>
        </div>
      </div>

      {/* Action button */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onStartRoute}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
        >
          Start Navigation <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};
