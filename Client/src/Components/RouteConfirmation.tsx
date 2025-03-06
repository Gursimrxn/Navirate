import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Footprints, X } from 'lucide-react';

export interface RouteConfirmationProps {
  destination: string;
  steps: number;
  time: string;
  onStartRoute: () => void;
  onDiscard: () => void;
}

export const RouteConfirmation: React.FC<RouteConfirmationProps> = ({
  destination,
  steps,
  time,
  onStartRoute,
  onDiscard
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-green-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Route Ready</h2>
          </div>
          <button 
            onClick={onDiscard}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Destination: {destination}
          </h3>
          
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <Footprints size={18} className="text-blue-500" />
              <span>{steps} steps</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <span>~{time} min</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onDiscard}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onStartRoute}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
            >
              Start <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
