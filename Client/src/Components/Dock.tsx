import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import SearchBar from './SearchBar';
import { navigationEvents } from '../services/eventService';

interface DockProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
}

export const Dock: React.FC<DockProps> = ({
  isOpen,
  onClose,
  children,
  currentFloor,
  setCurrentFloor,
}) => {
    const [isSearching, setIsSearching] = useState(false);
    const [startId, setStartId] = useState('');
    const [endId, setEndId] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    const handleCalculateRoute = async () => {
        if (!startId || !endId) return;
        
        setIsAnimating(true);
        try {
            await navigationEvents.emit(startId, endId);
            setIsSearching(false);
        } catch (error) {
            console.error('Route calculation failed:', error);
        } finally {
            setIsAnimating(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isSearching && (
                    <SearchBar 
                        onClose={() => setIsSearching(false)}
                        startId={startId}
                        endId={endId}
                        setStartId={setStartId}
                        setEndId={setEndId}
                        onCalculateRoute={handleCalculateRoute}
                        isAnimating={isAnimating}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-lg z-40"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="w-16 h-1 mx-auto my-3 bg-gray-300 rounded-full" />
                        <div className="h-[60vh] max-h-[500px]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                className="fixed bottom-0 select-none w-full z-20"
                animate={{ 
                    y: isSearching ? 100 : 0,
                    opacity: isSearching ? 0 : 1
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center gap-2 w-xl bg-white rounded-t-3xl shadow-2xl p-4 mx-auto">
                    {/* Popular Places (Inactive) */}
                    <div className="flex flex-col items-center">
                        <motion.button 
                            className="flex justify-center items-center cursor-pointer bg-[#F2F2F2] w-[60px] h-[50px] rounded-[15px]"
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: '#E5E5E5',
                                transition: { duration: 0.2 }
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z" fill="black" fillOpacity="0.7"/>
                            </svg>
                        </motion.button>
                        <span className="text-sm mt-1 text-gray-500">Popular Places</span>
                    </div>

                    {/* Choose Destination (Active) */}
                    <div className="flex flex-col items-center flex-1 mx-2">
                        <motion.button 
                            className="flex justify-center items-center bg-[#30A953] w-full h-[50px] cursor-pointer rounded-2xl"
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: '#278C44',
                                transition: { duration: 0.2 }
                            }}
                            onClick={() => setIsSearching(true)}
                        >
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <path d="M12 0L12.001 3.06201C15.6192 3.51365 18.4869 6.38163 18.9381 10H22V12L18.938 12.001C18.4864 15.6189 15.6189 18.4864 12.001 18.938L12 22H10V18.9381C6.38163 18.4869 3.51365 15.6192 3.06201 12.001L0 12V10H3.06189C3.51312 6.38129 6.38129 3.51312 10 3.06189V0H12ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5ZM11 9C12.1046 9 13 9.8954 13 11C13 12.1046 12.1046 13 11 13C9.8954 13 9 12.1046 9 11C9 9.8954 9.8954 9 11 9Z" fill="white"/>
                            </svg>
                        </motion.button>
                        <span className="text-sm mt-1 text-black font-semibold">Choose Destination</span>
                    </div>

                    {/* Settings (Inactive) */}
                    <div className="flex flex-col items-center">
                        <motion.button 
                            className="flex justify-center items-center cursor-pointer bg-[#F2F2F2] w-[60px] h-[50px] rounded-[15px]"
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: '#E5E5E5',
                                transition: { duration: 0.2 }
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="black" fillOpacity="0.7"/>
                            </svg>
                        </motion.button>
                        <span className="text-sm mt-1 text-gray-500">Settings</span>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
