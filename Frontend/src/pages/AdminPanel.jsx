import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  TagIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "active",
      joinedDate: "2022-03-15",
      totalListings: 24,
      totalSwaps: 18,
      points: 450,
      rating: 4.9,
      lastActive: "2023-11-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "suspended",
      joinedDate: "2023-01-20",
      totalListings: 8,
      totalSwaps: 3,
      points: 120,
      rating: 3.2,
      lastActive: "2023-11-10T14:20:00Z"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma@example.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "active",
      joinedDate: "2023-06-10",
      totalListings: 12,
      totalSwaps: 9,
      points: 280,
      rating: 4.7,
      lastActive: "2023-11-14T09:15:00Z"
    }
  ];

  const mockItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "https://images.unsplash.com/photo-1544966503-7ba7ac4db95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      seller: "Sarah Johnson",
      price: 150,
      category: "Outerwear",
      status: "pending_approval",
      reportCount: 0,
      createdAt: "2023-11-15T10:30:00Z",
      flagged: false
    },
    {
      id: 2,
      title: "Designer Handbag",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      seller: "Emma Davis",
      price: 320,
      category: "Accessories",
      status: "approved",
      reportCount: 2,
      createdAt: "2023-11-10T14:20:00Z",
      flagged: true
    },
    {
      id: 3,
      title: "Suspicious Listing",
      image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      seller: "Michael Chen",
      price: 50,
      category: "Outerwear",
      status: "flagged",
      reportCount: 5,
      createdAt: "2023-11-08T09:15:00Z",
      flagged: true
    }
  ];

  const mockReports = [
    {
      id: 1,
      type: "inappropriate_content",
      itemId: 2,
      itemTitle: "Designer Handbag",
      reportedBy: "John Doe",
      reason: "Item appears to be counterfeit",
      status: "pending",
      createdAt: "2023-11-15T10:30:00Z"
    },
    {
      id: 2,
      type: "spam",
      itemId: 3,
      itemTitle: "Suspicious Listing",
      reportedBy: "Jane Smith",
      reason: "Duplicate listing with fake photos",
      status: "under_review",
      createdAt: "2023-11-14T14:20:00Z"
    },
    {
      id: 3,
      type: "offensive_user",
      userId: 2,
      userName: "Michael Chen",
      reportedBy: "Alice Johnson",
      reason: "Inappropriate messages during swap negotiation",
      status: "resolved",
      createdAt: "2023-11-10T09:15:00Z"
    }
  ];

  const mockAnalytics = {
    totalUsers: 1247,
    activeUsers: 892,
    totalItems: 3456,
    totalSwaps: 2108,
    totalRevenue: 45678,
    pendingReviews: 23,
    flaggedItems: 12,
    monthlyGrowth: 15.2,
    conversionRate: 68.4,
    avgResponseTime: "2.4 hours"
  };

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setUsers(mockUsers);
      setItems(mockItems);
      setReports(mockReports);
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'items', name: 'Items', icon: TagIcon },
    { id: 'reports', name: 'Reports', icon: ExclamationTriangleIcon },
    { id: 'analytics', name: 'Analytics', icon: BanknotesIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'pending_approval':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
      case 'flagged':
        return 'text-red-600 bg-red-100';
      case 'banned':
        return 'text-red-800 bg-red-200';
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

  const handleUserAction = (userId, action) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: action === 'suspend' ? 'suspended' : 'active' }
        : user
    ));
    toast.success(`User ${action}ed successfully`);
  };

  const handleItemAction = (itemId, action) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: action }
        : item
    ));
    toast.success(`Item ${action} successfully`);
  };

  const handleReportAction = (reportId, action) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action }
        : report
    ));
    toast.success(`Report ${action} successfully`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: analytics.totalUsers?.toLocaleString(), icon: UsersIcon, color: 'bg-blue-500', change: '+12%' },
          { label: 'Active Items', value: analytics.totalItems?.toLocaleString(), icon: TagIcon, color: 'bg-green-500', change: '+8%' },
          { label: 'Total Swaps', value: analytics.totalSwaps?.toLocaleString(), icon: ShoppingBagIcon, color: 'bg-purple-500', change: '+15%' },
          { label: 'Pending Reviews', value: analytics.pendingReviews, icon: ClockIcon, color: 'bg-yellow-500', change: '-5%' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-neutral-900">{metric.value}</div>
                <div className="text-sm text-neutral-600">{metric.label}</div>
                <div className="text-xs text-green-600 mt-1">{metric.change}</div>
              </div>
              <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {items.filter(item => item.status === 'pending_approval').slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{item.title}</div>
                  <div className="text-sm text-neutral-600">by {item.seller}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleItemAction(item.id, 'approved')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleItemAction(item.id, 'rejected')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reports.filter(report => report.status !== 'resolved').slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">
                    {report.itemTitle || report.userName}
                  </div>
                  <div className="text-sm text-neutral-600">{report.reason}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Growth', value: `${analytics.monthlyGrowth}%`, color: 'text-green-600' },
            { label: 'Conversion Rate', value: `${analytics.conversionRate}%`, color: 'text-blue-600' },
            { label: 'Avg Response Time', value: analytics.avgResponseTime, color: 'text-purple-600' },
            { label: 'Flagged Items', value: analytics.flaggedItems, color: 'text-red-600' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">User Management</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search users..."
            className="input-field w-64"
          />
          <button className="btn-secondary">Export</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    <div>{user.totalListings} listings</div>
                    <div className="text-neutral-500">{user.totalSwaps} swaps</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{user.points} pts</div>
                    <div className="flex items-center text-sm text-neutral-500">
                      <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
                      {user.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleUserAction(user.id, 'suspend')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user.id, 'activate')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Item Management</h2>
        <div className="flex space-x-2">
          <select className="input-field">
            <option>All Items</option>
            <option>Pending Approval</option>
            <option>Approved</option>
            <option>Flagged</option>
          </select>
          <input
            type="text"
            placeholder="Search items..."
            className="input-field w-64"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden"
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              {item.flagged && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Flagged
                </div>
              )}
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <div className="text-sm text-neutral-600 mb-2">
                by {item.seller} • {item.category}
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary-600">{item.price} pts</span>
                {item.reportCount > 0 && (
                  <span className="text-xs text-red-600">
                    {item.reportCount} reports
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {item.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleItemAction(item.id, 'approved')}
                      className="flex-1 btn-primary text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleItemAction(item.id, 'rejected')}
                      className="flex-1 btn-secondary text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {item.status === 'approved' && (
                  <button
                    onClick={() => handleItemAction(item.id, 'flagged')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700"
                  >
                    Flag Item
                  </button>
                )}
                {item.status === 'flagged' && (
                  <button
                    onClick={() => handleItemAction(item.id, 'approved')}
                    className="flex-1 btn-primary text-sm"
                  >
                    Unflag
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Reports Management</h2>
        <select className="input-field">
          <option>All Reports</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Resolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-neutral-900">
                    {report.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  Reported by {report.reportedBy} on {formatDate(report.createdAt)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="font-medium text-neutral-900 mb-1">
                Target: {report.itemTitle || report.userName}
              </div>
              <div className="text-neutral-600">{report.reason}</div>
            </div>

            {report.status !== 'resolved' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReportAction(report.id, 'under_review')}
                  className="btn-secondary text-sm"
                >
                  Review
                </button>
                <button
                  onClick={() => handleReportAction(report.id, 'resolved')}
                  className="btn-primary text-sm"
                >
                  Resolve
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Escalate
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-600">Loading admin panel...</p>
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
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-neutral-900 font-display">Admin Panel</h1>
          </div>
          <p className="text-neutral-600">Manage the ReWear platform</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
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
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'items' && renderItems()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 text-center">
              <ChartBarIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Advanced Analytics</h3>
              <p className="text-neutral-600">Detailed analytics dashboard coming soon!</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 text-center">
              <CogIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Platform Settings</h3>
              <p className="text-neutral-600">Platform configuration panel coming soon!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel; 