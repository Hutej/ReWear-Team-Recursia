import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ClothingModel from '../components/3d/ClothingModel';
import ItemCard from '../components/ItemCard';

const ItemListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock item data
  const mockItem = {
    id: parseInt(id),
    title: "Vintage Denim Jacket",
    description: "This is a classic 90s denim jacket in excellent condition. Perfect for layering and adds a vintage touch to any outfit. The jacket features authentic wear patterns that give it character while maintaining its structural integrity. It's been well-maintained and comes from a smoke-free home. This piece would be perfect for someone looking to add a timeless piece to their wardrobe.",
    images: [
      "https://images.unsplash.com/photo-1544966503-7ba7ac4db95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    ],
    price: 150,
    points: 150,
    category: "Outerwear",
    condition: "Excellent",
    size: "M",
    availableSizes: ["S", "M", "L"],
    location: "San Francisco, CA",
    createdAt: "2023-11-15T10:30:00Z",
    tags: ["vintage", "denim", "classic", "90s", "unisex"],
    brand: "Levi's",
    material: "100% Cotton Denim",
    color: "Classic Blue",
    measurements: {
      chest: "44 inches",
      length: "26 inches",
      sleeves: "24 inches"
    },
    user: {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      rating: 4.9,
      totalRatings: 127,
      joinedDate: "2022-03-15",
      totalListings: 45,
      completedSwaps: 38,
      responseTime: "Usually responds within 2 hours",
      bio: "Sustainable fashion enthusiast. Love finding unique pieces and giving them new life!"
    },
    isAvailable: true,
    views: 234,
    likes: 18,
    shipping: {
      free: true,
      estimatedDays: "3-5 business days",
      methods: ["Standard", "Express"]
    }
  };

  // Mock related items
  const mockRelatedItems = [
    {
      id: 2,
      title: "Vintage Leather Jacket",
      image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 200,
      points: 200,
      category: "Outerwear",
      condition: "Good",
      size: "M",
      location: "Los Angeles, CA",
      createdAt: "2023-11-14T14:20:00Z",
      tags: ["vintage", "leather", "classic"],
      user: {
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.7
      }
    },
    {
      id: 3,
      title: "Retro Windbreaker",
      image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 85,
      points: 85,
      category: "Outerwear",
      condition: "Excellent",
      size: "L",
      location: "Seattle, WA",
      createdAt: "2023-11-13T09:15:00Z",
      tags: ["retro", "windbreaker", "colorful"],
      user: {
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.8
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setItem(mockItem);
      setRelatedItems(mockRelatedItems);
      setSelectedSize(mockItem.size);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to favorites');
      return;
    }
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleRequestSwap = () => {
    if (!isAuthenticated) {
      toast.error('Please login to request swaps');
      navigate('/login');
      return;
    }
    if (user.id === item.user.id) {
      toast.error('You cannot swap with yourself');
      return;
    }
    toast.success('Swap request sent! The seller will be notified.');
  };

  const handleRedeemWithPoints = () => {
    if (!isAuthenticated) {
      toast.error('Please login to redeem items');
      navigate('/login');
      return;
    }
    if (user.points < item.points) {
      toast.error('Insufficient points for this item');
      return;
    }
    toast.success('Item redeemed successfully! Check your dashboard for details.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-600">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Item Not Found</h2>
            <p className="text-neutral-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/browse')}
              className="btn-primary"
            >
              Browse Other Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2 text-sm text-neutral-600 mb-8"
        >
          <button
            onClick={() => navigate('/browse')}
            className="hover:text-primary-600 transition-colors"
          >
            Browse Items
          </button>
          <span>/</span>
          <span className="text-neutral-900">{item.category}</span>
          <span>/</span>
          <span className="text-neutral-900 truncate">{item.title}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-lg">
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-neutral-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-neutral-700" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {item.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {item.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {item.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex
                        ? 'border-primary-600'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 3D Model */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">3D Preview</h3>
              <div className="flex justify-center">
                <ClothingModel
                  itemType="tshirt"
                  color="#4ade80"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </motion.div>

          {/* Item Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                  {item.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <span className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{item.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>{item.views} views</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  {isFavorited ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-neutral-600" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <ShareIcon className="w-6 h-6 text-neutral-600" />
                </motion.button>
              </div>
            </div>

            {/* Price and Points */}
            <div className="bg-[#EEEFE0] rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-8 h-8" />
                  <span className="text-3xl font-bold text-primary-600">
                    {item.points} pts
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Equivalent to</div>
                  <div className="text-lg font-semibold text-neutral-900">
                    ${item.price}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Price includes ReWear protection</span>
              </div>
            </div>

            {/* Item Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm text-neutral-600">Condition</div>
                <div className={`text-lg font-semibold ${item.condition === 'Excellent' ? 'text-green-600' :
                    item.condition === 'Good' ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                  {item.condition}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm text-neutral-600">Size</div>
                <div className="text-lg font-semibold text-neutral-900">{item.size}</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm text-neutral-600">Brand</div>
                <div className="text-lg font-semibold text-neutral-900">{item.brand}</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm text-neutral-600">Material</div>
                <div className="text-lg font-semibold text-neutral-900">{item.material}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestSwap}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <ArrowsRightLeftIcon className="w-5 h-5" />
                <span>Request Swap</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedeemWithPoints}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>Redeem with Points</span>
              </motion.button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Description</h3>
              <p className="text-neutral-600 leading-relaxed">
                {showFullDescription ? item.description : `${item.description.substring(0, 200)}...`}
              </p>
              {item.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary-600 hover:text-primary-700 transition-colors mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>



            {/* Seller Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-neutral-900">{item.user.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span>{item.user.rating}</span>
                      <span>({item.user.totalRatings} reviews)</span>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    {item.user.responseTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-neutral-900">{item.user.totalListings}</div>
                  <div className="text-sm text-neutral-600">Items Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-neutral-900">{item.user.completedSwaps}</div>
                  <div className="text-sm text-neutral-600">Completed Swaps</div>
                </div>
              </div>

              <p className="text-sm text-neutral-600 mb-4">{item.user.bio}</p>

              <div className="flex space-x-3">
                <button className="flex-1 btn-ghost text-sm">
                  <UserCircleIcon className="w-4 h-4 mr-2" />
                  View Profile
                </button>
                <button className="flex-1 btn-ghost text-sm">
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                  Message
                </button>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Shipping & Returns</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TruckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-600">
                    {item.shipping.free ? 'Free shipping' : 'Paid shipping'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-neutral-600">
                    Estimated delivery: {item.shipping.estimatedDays}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-neutral-600">
                    ReWear Buyer Protection included
                  </span>
                </div>
              </div>
            </div>

            {/* Report Item */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Report this item</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 font-display mb-8">
            Similar Items
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedItems.map((relatedItem, index) => (
              <motion.div
                key={relatedItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ItemCard item={relatedItem} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemListingPage; 