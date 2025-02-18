import { motion } from "framer-motion";

interface RouteConfirmationProps {
  destination: string;
  steps: number;
  time: string;
  onStartRoute: () => void;
  onDiscard: () => void;
}

export function RouteConfirmation({
  destination,
  steps,
  time,
  onStartRoute,
  onDiscard,
}: RouteConfirmationProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-white p-4 z-50 shadow-2xl rounded-t-2xl"
    >
      <h2 className="text-xl font-semibold mb-2">{destination}</h2>
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{steps} steps</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{time} minutes</span>
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={onDiscard}
          className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300"
        >
          Discard
        </button>
        <button
          onClick={onStartRoute}
          className="bg-green-500 text-white px-4 py-2 rounded-xl"
        >
          Start
        </button>
      </div>
    </motion.div>
  );
}
