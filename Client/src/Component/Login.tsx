import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ id: "", password: "" });


  interface ChangeEvent {
    target: {
      name: string;
      value: string;
    };
  }

  const handleChange = (e: ChangeEvent) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const endpoint = isRegister ? "https://ccf2-112-196-126-3.ngrok-free.app/register" : "https://ccf2-112-196-126-3.ngrok-free.app/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    console.log(result);
    alert(result.message || "Success!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-screen bg-white px-4"
    >
      <motion.h1 
        className="text-3xl font-bold text-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {isRegister ? "Create an Account" : "Sign In"}
      </motion.h1>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={isRegister ? "register" : "login"}
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <motion.input 
            type="email" 
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="testuser@example.com" 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
          
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <motion.input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Test@1234" 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
          
          <motion.button 
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={handleSubmit}
          >
            {isRegister ? "Sign up" : "Sign in"}
          </motion.button>
          
          {!isRegister && <p className="text-center text-sm text-gray-600 mt-4 cursor-pointer">Forgot Password?</p>}
          <hr className="my-4" />
          <p className="text-center text-sm text-gray-600">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <motion.span 
              className="text-green-500 cursor-pointer"
              onClick={() => setIsRegister(!isRegister)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {isRegister ? "Sign in" : "Sign up"}
            </motion.span>
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Auth;
