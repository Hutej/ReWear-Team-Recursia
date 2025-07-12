import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern floating card component with glassmorphism
const FloatingClothingCard = ({ 
  itemType = 'tshirt',
  className = '',
  width = 300,
  height = 300 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Get clothing item data
  const getItemData = () => {
    switch (itemType) {
      case 'dress':
        return {
          icon: '👗',
          title: 'Dress',
          description: 'Elegant & Stylish',
          patterns: ['🌸', '✨', '🦋']
        };
      case 'pants':
        return {
          icon: '👖',
          title: 'Pants',
          description: 'Comfort & Style',
          patterns: ['🌿', '✨', '🍃']
        };
      case 'shoes':
        return {
          icon: '👟',
          title: 'Shoes',
          description: 'Step in Style',
          patterns: ['⚡', '✨', '🌟']
        };
      default:
        return {
          icon: '👕',
          title: 'T-Shirt',
          description: 'Casual & Cool',
          patterns: ['🌱', '✨', '🌿']
        };
    }
  };

  const itemData = getItemData();

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className={`w-full h-full rounded-3xl glass-effect shadow-2xl border border-white/30 overflow-hidden cursor-pointer`}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center">
            {/* Main icon */}
            <motion.div
              className="text-8xl mb-4"
              animate={{
                rotate: isHovered ? [0, 5, -5, 0] : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {itemData.icon}
            </motion.div>

            {/* Title */}
            <motion.h3
              className="text-2xl font-bold text-sage-800 mb-2"
              animate={{ y: isHovered ? -5 : 0 }}
            >
              {itemData.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-sage-600 text-sm mb-6"
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              {itemData.description}
            </motion.p>

            {/* Decorative patterns */}
            <div className="flex space-x-2">
              {itemData.patterns.map((pattern, index) => (
                <motion.span
                  key={index}
                  className="text-2xl"
                  animate={{
                    y: isHovered ? [-2, 2, -2] : 0,
                    rotate: isHovered ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.8,
                    repeat: isHovered ? Infinity : 0,
                  }}
                >
                  {pattern}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Modern clothing showcase component
const ClothingShowcase = ({ items = ['tshirt', 'dress', 'pants'], className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-6 justify-center ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <FloatingClothingCard
            itemType={item}
            width={250}
            height={300}
            className="hover:shadow-glow transition-all duration-300"
          />
        </motion.div>
      ))}
    </div>
  );
};

// Interactive hero display
const InteractiveHeroDisplay = ({ className = '' }) => {
  const [activeItem, setActiveItem] = useState(0);
  const items = [
    { type: 'tshirt', label: 'Casual Wear' },
    { type: 'dress', label: 'Elegant Dresses' },
    { type: 'pants', label: 'Comfortable Pants' },
    { type: 'shoes', label: 'Stylish Footwear' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className={`text-center ${className}`}>
      <div className="mb-8">
        <FloatingClothingCard
          itemType={items[activeItem].type}
          width={400}
          height={400}
          className="mx-auto"
        />
      </div>
      
      <div className="flex justify-center space-x-4 mb-2">
        {items.map((item, index) => (
          <button
            key={item.type}
            onClick={() => setActiveItem(index)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              activeItem === index
                ? 'bg-gradient-to-r from-[#A7C1A8] to-[#D1D8BE] text-black shadow-lg'
                : 'bg-white/50 text-sage-600 hover:bg-white/70'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Export the main component (backwards compatibility)
const ClothingModel = FloatingClothingCard;

export default ClothingModel;
export { FloatingClothingCard, ClothingShowcase, InteractiveHeroDisplay }; 