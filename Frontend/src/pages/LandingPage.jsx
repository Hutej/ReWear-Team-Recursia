import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// import ClothingModel from '../components/3d/ClothingModel';
import Carousel from '../components/Carousel';
import ItemCard from '../components/ItemCard';

const LandingPage = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [itemsRef, itemsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Mock data for featured items
  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      description: "Classic 90s denim jacket in excellent condition. Perfect for layering.",
      image: "https://images.unsplash.com/photo-1544966503-7ba7ac4db95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 150,
      points: 150,
      category: "Outerwear",
      condition: "Excellent",
      size: "M",
      location: "San Francisco, CA",
      createdAt: "2023-11-15T10:30:00Z",
      tags: ["vintage", "denim", "classic"],
      user: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.9
      }
    },
    {
      id: 2,
      title: "Floral Summer Dress",
      description: "Beautiful floral pattern dress perfect for summer occasions.",
      image: "https://images.unsplash.com/photo-1566479179817-c6c8e5d3a8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 80,
      points: 80,
      category: "Dresses",
      condition: "Good",
      size: "S",
      location: "Los Angeles, CA",
      createdAt: "2023-11-14T14:20:00Z",
      tags: ["floral", "summer", "casual"],
      user: {
        name: "Emma Davis",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.7
      }
    },
    {
      id: 3,
      title: "Designer Wool Coat",
      description: "Luxury wool coat from premium brand. Warm and stylish.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 250,
      points: 250,
      category: "Outerwear",
      condition: "Excellent",
      size: "L",
      location: "New York, NY",
      createdAt: "2023-11-13T09:15:00Z",
      tags: ["designer", "wool", "luxury"],
      user: {
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.8
      }
    },
    {
      id: 4,
      title: "Athletic Sneakers",
      description: "Comfortable running shoes in great condition. Barely used.",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 120,
      points: 120,
      category: "Shoes",
      condition: "Good",
      size: "9",
      location: "Chicago, IL",
      createdAt: "2023-11-12T16:45:00Z",
      tags: ["athletic", "sneakers", "running"],
      user: {
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.6
      }
    },
    {
      id: 5,
      title: "Leather Handbag",
      description: "Genuine leather handbag with multiple compartments. Timeless design.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 180,
      points: 180,
      category: "Accessories",
      condition: "Excellent",
      size: "One Size",
      location: "Seattle, WA",
      createdAt: "2023-11-11T11:20:00Z",
      tags: ["leather", "handbag", "classic"],
      user: {
        name: "Jessica Park",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.9
      }
    },
    {
      id: 6,
      title: "Cashmere Sweater",
      description: "Soft cashmere sweater in beautiful burgundy color. Luxury comfort.",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 200,
      points: 200,
      category: "Knitwear",
      condition: "Excellent",
      size: "M",
      location: "Boston, MA",
      createdAt: "2023-11-10T13:30:00Z",
      tags: ["cashmere", "luxury", "sweater"],
      user: {
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.8
      }
    }
  ];

  // Category data
  const categories = [
    { name: "Dresses", icon: "👗", count: 1250, color: "from-pink-500 to-rose-500" },
    { name: "Outerwear", icon: "🧥", count: 890, color: "from-blue-500 to-indigo-500" },
    { name: "Shoes", icon: "👟", count: 1100, color: "from-green-500 to-emerald-500" },
    { name: "Accessories", icon: "👜", count: 750, color: "from-purple-500 to-violet-500" },
    { name: "Knitwear", icon: "🧶", count: 620, color: "from-orange-500 to-amber-500" },
    { name: "Jeans", icon: "👖", count: 980, color: "from-cyan-500 to-teal-500" },
  ];

  // Stats data
  const stats = [
    { icon: UsersIcon, value: "50K+", label: "Active Users" },
    { icon: ArrowPathIcon, value: "125K+", label: "Items Swapped" },
    { icon: HeartIcon, value: "98%", label: "Satisfaction Rate" },
    { icon: GlobeAltIcon, value: "180+", label: "Cities Worldwide" },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-eco-beige"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-eco-sage rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-200"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-400"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
                >
                  <SparklesIcon className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-primary-600">
                    Join the Sustainable Fashion Revolution
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 font-display leading-tight"
                >
                  Give Your
                  <span className="block text-primary-600">Wardrobe</span>
                  <span className="block">A Second Life</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-xl text-neutral-600 leading-relaxed max-w-xl"
                >
                  Join thousands of fashion lovers in our community clothing exchange. 
                  Discover unique pieces, earn points, and make sustainable choices that 
                  benefit both your style and the planet.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/register" className="btn-primary text-center group">
                  Start Swapping
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="btn-secondary text-center">
                  Browse Items
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Models */}
            {/* <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-8">
                  <ClothingModel 
                    itemType="tshirt" 
                    color="#22c55e" 
                    width={200} 
                    height={200}
                    className="animate-slide-in-left"
                  />
                  <ClothingModel 
                    itemType="pants" 
                    color="#16a34a" 
                    width={200} 
                    height={200}
                    className="animate-slide-in-left animation-delay-200"
                  />
                </div>
                <div className="space-y-8 pt-12">
                  <ClothingModel 
                    itemType="dress" 
                    color="#86efac" 
                    width={200} 
                    height={200}
                    className="animate-slide-in-right animation-delay-400"
                  />
                  <ClothingModel 
                    itemType="tshirt" 
                    color="#4ade80" 
                    width={200} 
                    height={200}
                    className="animate-slide-in-right animation-delay-600"
                  />
                </div>
              </div>
            </motion.div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Experience the future of sustainable fashion with our innovative platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Quality Assured",
                description: "Every item is verified for quality and authenticity before listing",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: ArrowPathIcon,
                title: "Easy Swapping",
                description: "Simple point-based system makes exchanging items effortless",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: GlobeAltIcon,
                title: "Global Community",
                description: "Connect with fashion lovers worldwide and discover unique pieces",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative bg-white p-8 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover amazing pieces across all fashion categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link to="/browse" className="block">
                  <div className={`relative bg-gradient-to-br ${category.color} rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section 
        ref={itemsRef}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={itemsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover the latest additions to our community marketplace
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={itemsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel 
              items={featuredItems}
              slidesToShow={3}
              autoPlay={true}
              autoPlayInterval={4000}
              className="mb-12"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={itemsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link to="/browse" className="btn-primary">
              View All Items
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-200"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-display">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join our community today and start discovering amazing fashion pieces 
              while making a positive impact on the environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-secondary bg-white text-primary-600 hover:bg-primary-50">
                Get Started Free
              </Link>
              <Link to="/browse" className="btn-ghost border-white text-white hover:bg-white/10">
                Explore Items
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 