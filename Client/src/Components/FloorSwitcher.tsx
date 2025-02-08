import React from "react";

interface FloorSwitcherProps {
    currentFloor: string;
    setCurrentFloor: (floor: string) => void;
}

export const FloorSwitcher: React.FC<FloorSwitcherProps> = ({
    currentFloor,
    setCurrentFloor,
}) => {
    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
            <span>Floor:</span>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow-lg">
                <div className="flex flex-col gap-2">
                    {["3", "2", "1", "G"].map((floor) => (
                        <button
                            key={floor}
                            onClick={() => setCurrentFloor(floor)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${
                    currentFloor === floor
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                        >
                            {floor}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
