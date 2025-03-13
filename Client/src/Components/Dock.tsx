import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import { navigationEvents } from "../services/eventService";
import { Clock } from "lucide-react";
import { navigationService } from "../services/navigationService";

// DockRouteConfirmation Props Interface
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

// DockRouteConfirmation Component
export const DockRouteConfirmation: React.FC<DockRouteConfirmationProps> = ({
    destination,
    steps,
    time,
    onStartRoute,
    onCancel,
}) => {
    // Track navigation state locally
    const [isNavigating, setIsNavigating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleCancel = () => {
        // Clear the navigation state in the service
        navigationService.cancelNavigation();
        setIsNavigating(false);
        // Call the provided onCancel callback
        onCancel();
    };

    const handleStartRoute = () => {
        // Update local state first
        setIsNavigating(true);
        // Then call the provided callback
        onStartRoute();
    };

    // Button padding needs to use actual strings rather than template literals for Tailwind
    const buttonPadding = "py-2.5";
    const containerPadding = "p-3";

    return (
        <div
            className="fixed bottom-0 left-0 right-0 flex justify-center z-[1000]"
            ref={containerRef}
        >
            <motion.div
                className="flex flex-col bg-white backdrop-blur-sm w-full p-4 max-w-lg rounded-t-3xl shadow-xl pb-10 overflow-hidden"
                initial={{ y: 100, opacity: 0 }}
                animate={{
                    y: 0,
                    opacity: 1,
                    transition: { type: "spring", damping: 25, stiffness: 300 },
                }}
                exit={{
                    y: 100,
                    opacity: 0,
                    transition: { duration: 0.2 },
                }}
            >
                <div className="border-b border-gray-100">
                    {/* Header row with title */}
                        <div className="flex flex-col items-start justify-center gap-2 p-3">
                            <div className="flex justify-between w-full font-bold text-xl">
                                To {destination.name}
                                {/* Chips for steps and time */}
                                <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-[#0000001A] px-3 py-2 rounded-full">
                                <svg
                                    width="10"
                                    height="11"
                                    viewBox="0 0 10 11"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 8.97552H3.75V9.60052C3.75 10.3599 3.13439 10.9755 2.375 10.9755C1.61561 10.9755 1 10.3599 1 9.60052V8.97552ZM3 3.0358C4 3.0358 4.5 4.4755 4.5 5.47552C4.5 5.97552 4.25 6.47552 4 7.22552L3.75 7.97552H1C1 7.47552 0.75 6.72552 0.75 5.47552C0.75 4.2255 1.74891 3.0358 3 3.0358ZM9.027 7.02467L8.91845 7.64017C8.7866 8.38802 8.0734 8.88737 7.32555 8.75552C6.5777 8.62367 6.07835 7.91047 6.21025 7.16262L6.31875 6.54712L9.027 7.02467ZM8.0888 0.827906C9.32085 1.04516 10.098 2.39024 9.88095 3.62125C9.6639 4.85226 9.28745 5.54747 9.20065 6.03987L6.4924 5.56232L6.37645 4.7803C6.26045 3.99829 6.1011 3.46247 6.1879 2.97007C6.36155 1.98526 7.10395 0.654261 8.0888 0.827906Z"
                                        fill="black"
                                    />
                                </svg>

                                <span className="text-xs font-medium">
                                    {steps} steps
                                </span>
                            </div>

                            <div className="flex items-center gap-1 bg-[#0000001A] px-3 py-2 rounded-full">
                                <Clock size={14} />
                                <span className="text-xs font-medium">
                                    {time} {time == "1" ? "minute" : "minutes"}
                                </span>
                            </div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-left text-sm truncate">
                                {destination.description}
                            </p>
                        </div>
                </div>

                {/* Action buttons - fixed at bottom */}
                <div className="bg-white border-t border-gray-100 mt-auto">
                    <div className={containerPadding + " flex gap-2 w-full"}>
                        {!isNavigating ? (
                            // Show "Start" button when not navigating
                            <motion.button
                                onClick={handleStartRoute}
                                whileTap={{ scale: 0.97 }}
                                className={`w-full h-14 rounded-2xl ${buttonPadding} bg-[#30A953] text-white font-medium flex items-center justify-center gap-1 hover:bg-green-600 active:bg-green-700 transition-all duration-150`}
                            >
                                Start
                            </motion.button>
                        ) : (
                            // Show "Cancel" button when navigating
                            <motion.button
                                onClick={handleCancel}
                                whileTap={{ scale: 0.97 }}
                                className={`w-full ${buttonPadding} border bg-[#FF000040] border-[#FF000040] rounded-lg text-gray-700 font-medium hover:bg-[#FF000060] active:bg-[#FF000080] transition-all duration-150`}
                            >
                                Cancel
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

interface DockProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    currentFloor: string;
    setCurrentFloor: (floor: string) => void;
}

export const Dock: React.FC<DockProps> = ({ isOpen, children }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [startId, setStartId] = useState("");
    const [endId, setEndId] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    const handleCalculateRoute = async () => {
        if (!startId || !endId) return;

        setIsAnimating(true);
        try {
            await navigationEvents.emit(startId, endId);
            setIsSearching(false);
        } catch (error) {
            console.error("Route calculation failed:", error);
        } finally {
            setIsAnimating(false);
        }
    };

    // Hide bottom dock when another dock is open
    const shouldShowBottomDock = !isSearching && !isOpen;

    // Handle animation complete for proper cleanup
    const handleAnimationComplete = (definition: string) => {
        if (definition === "hidden") {
            // Any cleanup after close animation completes
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isSearching && (
                    <motion.div className="z-[999]">
                        <SearchBar
                            onClose={() => setIsSearching(false)}
                            startId={startId}
                            endId={endId}
                            setStartId={setStartId}
                            setEndId={setEndId}
                            onCalculateRoute={handleCalculateRoute}
                            isAnimating={isAnimating}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mx-auto fixed w-full max-w-md inset-x-0 bottom-0 rounded-t-2xl z-[1000]"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        <div className="flex justify-center max-h-[500px]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="fixed bottom-0 select-none w-full z-20"
                animate={{
                    y: shouldShowBottomDock ? 0 : 100,
                    opacity: shouldShowBottomDock ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center gap-2 w-full max-w-lg bg-white rounded-t-4xl shadow-2xl p-6 pb-10 mx-auto">
                    <div className="flex flex-col items-center">
                        <motion.button
                            className="flex justify-center items-center cursor-pointer bg-[#F2F2F2] w-[60px] h-[50px] rounded-[15px]"
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: "#E5E5E5",
                                transition: { duration: 0.2 },
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z"
                                    fill="black"
                                    fillOpacity="0.7"
                                />
                            </svg>
                        </motion.button>
                        <span className="font-inter text-xs mt-1 text-gray-500">
                            Popular Places
                        </span>
                    </div>

                    {/* Choose Destination (Active) */}
                    <div className="flex flex-col items-center flex-1 mx-2">
                        <motion.button
                            className="flex justify-center items-center bg-[#30A953] w-full h-[50px] cursor-pointer rounded-2xl"
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: "#278C44",
                                transition: { duration: 0.2 },
                            }}
                            onClick={() => setIsSearching(true)}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                            >
                                <path
                                    d="M12 0L12.001 3.06201C15.6192 3.51365 18.4869 6.38163 18.9381 10H22V12L18.938 12.001C18.4864 15.6189 15.6189 18.4864 12.001 18.938L12 22H10V18.9381C6.38163 18.4869 3.51365 15.6192 3.06201 12.001L0 12V10H3.06189C3.51312 6.38129 6.38129 3.51312 10 3.06189V0H12ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5ZM11 9C12.1046 9 13 9.8954 13 11C13 12.1046 12.1046 13 11 13C9.8954 13 9 12.1046 9 11C9 9.8954 9.8954 9 11 9Z"
                                    fill="white"
                                />
                            </svg>
                        </motion.button>
                        <span className="font-inter text-xs mt-1 text-black">
                            Choose Destination
                        </span>
                    </div>

                    {/* Settings (Inactive) */}
                    <div className="flex flex-col items-center">
                        <motion.button
                            className="flex justify-center items-center cursor-pointer bg-[#F2F2F2] w-[60px] h-[50px] rounded-[15px]"
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: "#E5E5E5",
                                transition: { duration: 0.2 },
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                                    fill="black"
                                    fillOpacity="0.7"
                                />
                            </svg>
                        </motion.button>
                        <span className="font-inter text-xs mt-1 text-gray-500">
                            Settings
                        </span>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
