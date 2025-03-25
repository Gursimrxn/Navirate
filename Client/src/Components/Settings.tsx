import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronRight, Volume2, Bell, Map, Eye, Clock, PhoneIcon, Moon } from "lucide-react";

interface SettingsProps {
    onClose: () => void;
}

// Toggle Switch Component
const ToggleSwitch: React.FC<{ 
    isEnabled: boolean; 
    onToggle: () => void;
    label?: string;
}> = ({ isEnabled, onToggle, label }) => {
    return (
        <div className="flex items-center justify-between w-full">
            {label && <span className="text-sm text-foreground/70">{label}</span>}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle();
                }}
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    isEnabled ? "bg-blue-600" : "bg-gray-400"
                }`}
                aria-pressed={isEnabled}
                aria-label={label || "Toggle"}
            >
                <span className="sr-only">Toggle {label}</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
};

// Setting Section Component
const SettingSection: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }) => {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-3">
                {title}
            </h3>
            <div className="bg-background rounded-2xl shadow-sm p-4 space-y-4 border border-foreground/10">
                {children}
            </div>
        </div>
    );
};

// Setting Item Component
const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
                <div className="mr-3 text-foreground/70">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-foreground">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-xs text-foreground/70">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div>{action}</div>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    // Settings state
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [highContrastMode, setHighContrastMode] = useState(false);
    const [use24HourFormat, setUse24HourFormat] = useState(false);
    const [showPointsOfInterest, setShowPointsOfInterest] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage, default to true if not set
        const savedMode = localStorage.getItem('darkMode');
        return savedMode !== null ? savedMode === 'true' : true;
    });

    useEffect(() => {
        // Apply dark mode and save preference
        if (darkMode) {
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Save to localStorage
        localStorage.setItem('darkMode', darkMode.toString());

        // Apply high contrast mode
        if (highContrastMode) {
            document.documentElement.classList.add("high-contrast");
        } else {
            document.documentElement.classList.remove("high-contrast");
        }
    }, [darkMode, highContrastMode]);

    return (<>
        <motion.div 
            className="fixed inset-0 bg-background text-foreground z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
            >
            {/* Header */}
            <div className="sticky top-0 bg-background shadow-sm backdrop:blur-2xl z-10 border-b border-foreground/10">
                <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
                    <h1 className="text-xl font-bold text-foreground">Settings</h1>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-foreground/10"
                        >
                        <X size={24} className="text-foreground" />
                    </button>
                </div>
            </div>

            {/* Settings Content */}
            <div className="max-w-lg mx-auto p-4 pb-24">
                <SettingSection title="Appearance">
                    <SettingItem 
                        icon={<Moon size={20} className="text-foreground" />}
                        title="Dark Mode"
                        description="Switch between light and dark theme"
                        action={<ToggleSwitch isEnabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />}
                    />
                    
                    <SettingItem 
                        icon={<Eye size={20} className="text-foreground" />}
                        title="High Contrast"
                        description="Increase contrast for better visibility"
                        action={<ToggleSwitch isEnabled={highContrastMode} onToggle={() => setHighContrastMode(!highContrastMode)} />}
                    />
                </SettingSection>

                <SettingSection title="Notifications">
                    <SettingItem 
                        icon={<Bell size={20} className="text-foreground" />}
                        title="Notifications"
                        description="Receive navigation updates and alerts"
                        action={<ToggleSwitch isEnabled={notifications} onToggle={() => setNotifications(!notifications)} />}
                        />
                    
                    <SettingItem 
                        icon={<Volume2 size={20} className="text-foreground" />}
                        title="Sound"
                        description="Play sounds during navigation"
                        action={<ToggleSwitch isEnabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />}
                        />
                    
                    <SettingItem 
                        icon={<PhoneIcon size={20} className="text-foreground" />}
                        title="Vibration"
                        description="Vibrate device during navigation cues"
                        action={<ToggleSwitch isEnabled={vibrationEnabled} onToggle={() => setVibrationEnabled(!vibrationEnabled)} />}
                    />
                </SettingSection>

                <SettingSection title="Navigation">
                    <SettingItem 
                        icon={<Map size={20} className="text-foreground" />}
                        title="Points of Interest"
                        description="Show popular destinations nearby"
                        action={<ToggleSwitch isEnabled={showPointsOfInterest} onToggle={() => setShowPointsOfInterest(!showPointsOfInterest)} />}
                        />
                    
                    <SettingItem 
                        icon={<Clock size={20} className="text-foreground" />}
                        title="24-Hour Format"
                        description="Display time in 24-hour format"
                        action={<ToggleSwitch isEnabled={use24HourFormat} onToggle={() => setUse24HourFormat(!use24HourFormat)} />}
                    />
                </SettingSection>

                <SettingSection title="Account">
                    <div className="flex items-center justify-between py-2 cursor-pointer text-foreground">
                        <span className="text-sm font-medium">Privacy Policy</span>
                        <ChevronRight size={16} className="text-foreground/70" />
                    </div>

                    <div className="flex items-center justify-between py-2 cursor-pointer text-foreground">
                        <span className="text-sm font-medium">Terms of Service</span>
                        <ChevronRight size={16} className="text-foreground/70" />
                    </div>

                    <div className="flex items-center justify-between py-2 cursor-pointer text-foreground">
                        <span className="text-sm font-medium">About Navirate</span>
                        <ChevronRight size={16} className="text-foreground/70" />
                    </div>
                </SettingSection>
                <div className="py-6 text-center text-xs text-foreground/70">
                    <p>Navirate v1.0.0</p>
                    <p className="mt-1">© 2025 Navirate - <a href="" className="hover:underline">Gursimran Singh</a>, <a href="" className="hover:underline">Aagam Jain</a></p>
                </div>
            </div>
        </motion.div>
    </>
    );
};

export default Settings;
