import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  StarIcon, 
  MapPinIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ItemCard = ({ 
  item, 
  className = '',
  showUserInfo = true,
  showLocation = true,
  onFavorite,
  isFavorited = false
}) => {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (onFavorite) {
      onFavorite(item.id);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInMinutes = Math.floor((now - itemDate) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      className={`card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${className}`}
    >
      <Link to={`/item/${item.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Favorite Button */}
          <motion.button
            onClick={handleFavoriteClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white/90 transition-colors"
          >
            {isFavorited ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-neutral-600" />
            )}
          </motion.button>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {item.category}
            </span>
          </div>
          
          {/* Condition Badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.condition === 'Excellent' 
                ? 'bg-green-100 text-green-800'
                : item.condition === 'Good'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {item.condition}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <TagIcon className="w-4 h-4 text-primary-600" />
              <span className="text-lg font-bold text-primary-600">
                {item.points || item.price} pts
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
          
          {/* Size and Tags */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
              Size: {item.size}
            </span>
            {item.tags && item.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-eco-beige text-eco-forest"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* User Info */}
          {showUserInfo && item.user && (
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-neutral-200">
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-neutral-700 font-medium">
                {item.user.name}
              </span>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-neutral-600">
                  {item.user.rating || 4.8}
                </span>
              </div>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="flex items-center justify-between text-sm text-neutral-500">
            {showLocation && (
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard; 