import React from "react";

interface FloorSwitcherProps {
    currentFloor: string;
    setCurrentFloor: (floor: string) => void;
    className?: string;
}

export const FloorSwitcher: React.FC<FloorSwitcherProps> = ({
    currentFloor,
    setCurrentFloor,
    className = ""
}) => {
    return (
        <div className={`${className} bg-white p-2 rounded-full shadow-lg`}>
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
    );
};
