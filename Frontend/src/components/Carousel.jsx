import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import ItemCard from './ItemCard';

const Carousel = ({ 
  items = [], 
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  slidesToShow = 3,
  renderItem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate responsive slides to show
  const [responsiveSlidesToShow, setResponsiveSlidesToShow] = useState(slidesToShow);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setResponsiveSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setResponsiveSlidesToShow(2);
      } else {
        setResponsiveSlidesToShow(slidesToShow);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesToShow]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered || items.length <= responsiveSlidesToShow) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = items.length - responsiveSlidesToShow;
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, items.length, responsiveSlidesToShow, autoPlayInterval]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = items.length - responsiveSlidesToShow;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = items.length - responsiveSlidesToShow;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!items || items.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center h-64 text-neutral-500`}>
        <p>No items to display</p>
      </div>
    );
  }

  const maxIndex = Math.max(0, items.length - responsiveSlidesToShow);
  const slideWidth = 100 / responsiveSlidesToShow;

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <motion.div
          className="flex transition-transform duration-500 ease-in-out"
          animate={{
            transform: `translateX(-${currentIndex * slideWidth}%)`
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className="flex-none px-2"
              style={{ width: `${slideWidth}%` }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {renderItem ? renderItem(item, index) : (
                  <ItemCard item={item} className="h-full" />
                )}
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > responsiveSlidesToShow && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-neutral-700" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6 text-neutral-700" />
          </motion.button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && items.length > responsiveSlidesToShow && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary-600 w-8' 
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Controls */}
      {autoPlay && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAutoPlay}
          className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          {isAutoPlaying ? (
            <PauseIcon className="w-4 h-4 text-neutral-700" />
          ) : (
            <PlayIcon className="w-4 h-4 text-neutral-700" />
          )}
        </motion.button>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200">
          <motion.div
            className="h-full bg-primary-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: autoPlayInterval / 1000,
              ease: "linear",
              repeat: Infinity 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Carousel; 