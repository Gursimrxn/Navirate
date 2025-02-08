import React from "react";
import { motion } from "framer-motion";

export const Navbar = () => {
    return (
        <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute z-20 left-1/2 -translate-x-1/2"
        >
            <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex justify-around items-center bg-white rounded-full gap-10 px-3 p-2"
            >
                <div className="flex items-center gap-2">
                    {['Restroom', 'Reception', 'Exit', 'Nurse Office'].map((item, index) => (
                        <motion.div
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center bg-black/10 rounded-full py-2.5 px-2.5 gap-1"
                        >
                            {/* Keep existing SVG for each item */}
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="font-satoshi text-base font-normal leading-[21px]"
                            >
                                {item}
                            </motion.span>
                        </motion.div>
                    ))}
                </div>

                <motion.svg
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer"
                    width="44"
                    height="44"
                    viewBox="0 0 45 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="0.682617"
                        y="0.697754"
                        width="43.6195"
                        height="43.6195"
                        rx="21.8098"
                        fill="#FFC9C9"
                    />
                    <path
                        d="M20.1742 19.0754L18.2178 19.7874V23.5765H16.0796V18.2844H16.0957L21.7281 16.2343C21.989 16.1339 22.2721 16.0838 22.5635 16.0936C23.7518 16.1228 24.7952 16.9017 25.1582 18.0389C25.3573 18.6632 25.5391 19.0845 25.7032 19.3027C26.6785 20.5995 28.2303 21.4382 29.978 21.4382V23.5765C27.653 23.5765 25.5758 22.5162 24.2031 20.853L23.5816 24.378L25.7016 26.431V34.2675H23.5634V27.8681L21.3725 25.7436L20.3593 30.3389L12.9893 29.0394L13.3605 26.9336L18.6249 27.8619L20.1742 19.0754ZM24.0979 15.5582C22.917 15.5582 21.9597 14.6009 21.9597 13.4199C21.9597 12.239 22.917 11.2817 24.0979 11.2817C25.2789 11.2817 26.2361 12.239 26.2361 13.4199C26.2361 14.6009 25.2789 15.5582 24.0979 15.5582Z"
                        fill="#FF0000"
                    />
                </motion.svg>
            </motion.div>
        </motion.div>
    );
};
