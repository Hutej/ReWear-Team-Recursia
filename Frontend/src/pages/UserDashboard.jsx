import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  UserCircleIcon,
  PlusIcon,
  TagIcon,
  ArrowPathIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
  GiftIcon,
  ChartBarIcon,
  PencilIcon,
  CogIcon,
  CalendarIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ItemCard from '../components/ItemCard';
// import ClothingModel from '../components/3d/ClothingModel';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userListings, setUserListings] = useState([]);
  const [userSwaps, setUserSwaps] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockListings = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "https://images.unsplash.com/photo-1544966503-7ba7ac4db95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 150,
      points: 150,
      category: "Outerwear",
      condition: "Excellent",
      size: "M",
      status: "active",
      views: 234,
      likes: 18,
      createdAt: "2023-11-15T10:30:00Z"
    },
    {
      id: 2,
      title: "Silk Evening Dress",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 320,
      points: 320,
      category: "Dresses",
      condition: "Excellent",
      size: "M",
      status: "sold",
      views: 156,
      likes: 24,
      createdAt: "2023-11-10T14:20:00Z"
    },
    {
      id: 3,
      title: "Cashmere Sweater",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      price: 200,
      points: 200,
      category: "Knitwear",
      condition: "Good",
      size: "L",
      status: "pending",
      views: 89,
      likes: 12,
      createdAt: "2023-11-08T09:15:00Z"
    }
  ];

  const mockSwaps = [
    {
      id: 1,
      type: "outgoing",
      status: "pending",
      item: {
        title: "Vintage Denim Jacket",
        image: "https://images.unsplash.com/photo-1544966503-7ba7ac4db95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        points: 150
      },
      partner: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.9
      },
      requestedAt: "2023-11-15T10:30:00Z"
    },
    {
      id: 2,
      type: "incoming",
      status: "completed",
      item: {
        title: "Designer Wool Coat",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        points: 250
      },
      partner: {
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
        rating: 4.8
      },
      completedAt: "2023-11-10T14:20:00Z"
    }
  ];

  const mockStats = {
    totalListings: 12,
    activeListings: 8,
    completedSwaps: 15,
    totalViews: 1247,
    totalLikes: 89,
    joinedDate: "2022-03-15",
    responseRate: 95,
    avgResponseTime: "2 hours"
  };

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setUserListings(mockListings);
      setUserSwaps(mockSwaps);
      setUserStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'listings', name: 'My Listings', icon: TagIcon },
    { id: 'swaps', name: 'Swaps', icon: ArrowPathIcon },
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'sold':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-black">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-primary-100">
              You have {userStats.activeListings} active listings and {user?.points} points
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{user?.points}</div>
            <div className="text-primary-100">Points</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: userStats.totalListings, icon: TagIcon, color: 'bg-blue-500' },
          { label: 'Completed Swaps', value: userStats.completedSwaps, icon: ArrowPathIcon, color: 'bg-green-500' },
          { label: 'Total Views', value: userStats.totalViews?.toLocaleString(), icon: EyeIcon, color: 'bg-purple-500' },
          { label: 'Total Likes', value: userStats.totalLikes, icon: HeartIcon, color: 'bg-red-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} text-white mr-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-gradient-to-br from-[#D1D8BE] to-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Listings</h3>
            <Link to="#" onClick={() => setActiveTab('listings')} className="text-primary-600 hover:text-primary-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {userListings.slice(0, 3).map((listing) => (
              <div key={listing.id} className="flex items-center space-x-3">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{listing.title}</div>
                  <div className="text-sm text-neutral-600">{listing.points} pts</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Swaps */}
        <div className="bg-gradient-to-br from-[#D1D8BE] to-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Swaps</h3>
            <Link to="#" onClick={() => setActiveTab('swaps')} className="text-primary-600 hover:text-primary-700 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {userSwaps.slice(0, 3).map((swap) => (
              <div key={swap.id} className="flex items-center space-x-3">
                <img
                  src={swap.item.image}
                  alt={swap.item.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{swap.item.title}</div>
                  <div className="text-sm text-neutral-600">with {swap.partner.name}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                  {swap.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions
      <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add New Item', icon: PlusIcon, href: '/add-item', color: 'bg-primary-600' },
            { label: 'Browse Items', icon: ShoppingBagIcon, href: '/browse', color: 'bg-green-600' },
            { label: 'View Profile', icon: UserCircleIcon, action: () => setActiveTab('profile'), color: 'bg-blue-600' },
            { label: 'Achievements', icon: TrophyIcon, href: '#', color: 'bg-yellow-600' }
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`${action.color} text-white rounded-lg p-4 text-center hover:opacity-90 transition-opacity`}
            >
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </div> */}
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">My Listings</h2>
        <Link to="/add-item" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add New Item</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userListings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden"
          >
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                {listing.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">{listing.title}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-primary-600">{listing.points} pts</span>
                <span className="text-sm text-neutral-600">Size {listing.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-600 mb-3">
                <span className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{listing.views}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{listing.likes}</span>
                </span>
                <span>{formatDate(listing.createdAt)}</span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 btn-ghost text-sm">
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <Link to={`/item/${listing.id}`} className="flex-1 btn-secondary text-sm">
                  View
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSwaps = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Swap History</h2>

      <div className="space-y-4">
        {userSwaps.map((swap, index) => (
          <motion.div
            key={swap.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className={`w-5 h-5 ${swap.type === 'outgoing' ? 'text-blue-600' : 'text-green-600'}`} />
                <span className="font-medium text-neutral-900">
                  {swap.type === 'outgoing' ? 'Swap Request Sent' : 'Swap Request Received'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
                {swap.status}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={swap.item.image}
                alt={swap.item.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">{swap.item.title}</h3>
                <p className="text-sm text-neutral-600">{swap.item.points} points</p>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={swap.partner.avatar}
                  alt={swap.partner.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-medium text-neutral-900">{swap.partner.name}</div>
                  <div className="flex items-center space-x-1 text-sm text-neutral-600">
                    <StarIcon className="w-3 h-3 text-yellow-500" />
                    <span>{swap.partner.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                {swap.completedAt ? `Completed ${formatDate(swap.completedAt)}` : `Requested ${formatDate(swap.requestedAt)}`}
              </span>
              {swap.status === 'pending' && (
                <div className="flex space-x-2">
                  <button className="btn-ghost text-sm">Decline</button>
                  <button className="btn-primary text-sm">Accept</button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Profile</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-neutral-900">{user?.name}</h3>
              <p className="text-neutral-600">{user?.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-neutral-600">4.9 (127 reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Tell others about yourself..."
                defaultValue="Sustainable fashion enthusiast. Love finding unique pieces and giving them new life!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
              <input
                type="text"
                className="input-field"
                placeholder="City, State"
                defaultValue="San Francisco, CA"
              />
            </div>
            <button className="btn-primary w-full">Update Profile</button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Statistics</h3>
          <div className="space-y-4">
            {[
              { label: 'Member Since', value: formatDate(userStats.joinedDate), icon: CalendarIcon },
              { label: 'Response Rate', value: `${userStats.responseRate}%`, icon: ChartBarIcon },
              { label: 'Avg Response Time', value: userStats.avgResponseTime, icon: CalendarIcon },
              { label: 'Total Earnings', value: '1,247 pts', icon: GiftIcon }
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <stat.icon className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700">{stat.label}</span>
                </div>
                <span className="font-medium text-neutral-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Avatar Preview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">3D Avatar Preview</h3>
        <div className="flex justify-center">
          {/* <ClothingModel 
            itemType="tshirt" 
            color="#22c55e" 
            width={200} 
            height={200}
          /> */}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 font-display">Dashboard</h1>
              <p className="text-neutral-600 mt-2">Manage your ReWear experience</p>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              <span className="text-lg font-semibold text-primary-600">{user?.points} pts</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'listings' && renderListings()}
          {activeTab === 'swaps' && renderSwaps()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 text-center">
              <CogIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Settings</h3>
              <p className="text-neutral-600">Settings panel coming soon!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard; 