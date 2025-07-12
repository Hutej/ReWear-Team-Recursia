import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TagIcon,
  CameraIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
// import ClothingModel from '../components/3d/ClothingModel';

const AddItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    size: '',
    brand: '',
    material: '',
    color: '',
    originalPrice: '',
    points: '',
    tags: [],
    measurements: {
      chest: '',
      waist: '',
      length: '',
      sleeves: ''
    },
    shipping: {
      free: true,
      weight: '',
      dimensions: ''
    }
  });
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'Dresses', label: 'Dresses' },
    { value: 'Tops', label: 'Tops' },
    { value: 'Bottoms', label: 'Bottoms' },
    { value: 'Outerwear', label: 'Outerwear' },
    { value: 'Shoes', label: 'Shoes' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Knitwear', label: 'Knitwear' },
    { value: 'Activewear', label: 'Activewear' },
    { value: 'Lingerie', label: 'Lingerie' },
    { value: 'Swimwear', label: 'Swimwear' }
  ];

  const conditions = [
    { value: '', label: 'Select Condition' },
    { value: 'Excellent', label: 'Excellent - Like new, no visible wear' },
    { value: 'Good', label: 'Good - Minor signs of wear' },
    { value: 'Fair', label: 'Fair - Noticeable wear but still wearable' },
    { value: 'Poor', label: 'Poor - Significant wear, needs repair' }
  ];

  const sizes = [
    { value: '', label: 'Select Size' },
    { value: 'XXS', label: 'XXS' },
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: 'XXXL', label: 'XXXL' },
    { value: 'One Size', label: 'One Size' }
  ];

  const steps = [
    { id: 1, title: 'Photos', description: 'Upload item photos' },
    { id: 2, title: 'Details', description: 'Add item information' },
    { id: 3, title: 'Pricing', description: 'Set points and tags' },
    { id: 4, title: 'Preview', description: 'Review and publish' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (images.length === 0) {
          newErrors.images = 'Please upload at least one image';
        }
        break;
      case 2:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.condition) newErrors.condition = 'Condition is required';
        if (!formData.size) newErrors.size = 'Size is required';
        break;
      case 3:
        if (!formData.points || formData.points < 1) newErrors.points = 'Points must be at least 1';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Item listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to list item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSuggestedPoints = () => {
    if (!formData.originalPrice || !formData.condition) return 0;
    
    const basePoints = parseInt(formData.originalPrice) * 0.6; // 60% of original price
    const conditionMultiplier = {
      'Excellent': 1,
      'Good': 0.8,
      'Fair': 0.6,
      'Poor': 0.4
    };
    
    return Math.round(basePoints * conditionMultiplier[formData.condition]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <PhotoIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                Upload Photos
              </h2>
              <p className="text-neutral-600">
                Add up to 5 photos of your item. The first photo will be the main image.
              </p>
            </div>

            {/* Image Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <CameraIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-primary cursor-pointer"
              >
                Choose Files
              </label>
              <p className="text-xs text-neutral-500 mt-2">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label
                    htmlFor="image-upload"
                    className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors"
                  >
                    <PlusIcon className="w-8 h-8 text-neutral-400" />
                  </label>
                )}
              </div>
            )}

            {errors.images && (
              <p className="text-red-600 text-sm">{errors.images}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <SparklesIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                Item Details
              </h2>
              <p className="text-neutral-600">
                Provide detailed information about your item to attract buyers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Vintage Levi's Denim Jacket"
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className={`input-field ${errors.condition ? 'border-red-500' : ''}`}
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="text-red-600 text-sm mt-1">{errors.condition}</p>
                  )}
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Size *
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className={`input-field ${errors.size ? 'border-red-500' : ''}`}
                  >
                    {sizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                  {errors.size && (
                    <p className="text-red-600 text-sm mt-1">{errors.size}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Levi's, Zara, H&M"
                    className="input-field"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="e.g., 100% Cotton, Polyester Blend"
                    className="input-field"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Blue, Black, Red"
                    className="input-field"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="What did you originally pay?"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your item in detail. Include any flaws, special features, or styling tips."
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <TagIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                Pricing & Tags
              </h2>
              <p className="text-neutral-600">
                Set your points and add tags to help buyers find your item.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Points */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    placeholder="How many points?"
                    className={`input-field ${errors.points ? 'border-red-500' : ''}`}
                  />
                  {errors.points && (
                    <p className="text-red-600 text-sm mt-1">{errors.points}</p>
                  )}
                  {formData.originalPrice && formData.condition && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Suggested: {calculateSuggestedPoints()} points
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add a tag..."
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Shipping */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Shipping
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shipping.free"
                        checked={formData.shipping.free}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          shipping: { ...prev.shipping, free: true }
                        }))}
                        className="mr-2"
                      />
                      Free shipping (I'll cover the cost)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shipping.free"
                        checked={!formData.shipping.free}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          shipping: { ...prev.shipping, free: false }
                        }))}
                        className="mr-2"
                      />
                      Buyer pays shipping
                    </label>
                  </div>
                </div>

                {/* 3D Preview */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">
                    3D Preview
                  </h3>
                  <div className="flex justify-center">
                    {/* <ClothingModel 
                      itemType="tshirt" 
                      color="#4ade80" 
                      width={150} 
                      height={150}
                    /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
                Review & Publish
              </h2>
              <p className="text-neutral-600">
                Review your listing before publishing it to the community.
              </p>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
              {images.length > 0 && (
                <div className="aspect-square">
                  <img
                    src={images[0].preview}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {formData.title}
                </h3>
                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                  {formData.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary-600">
                      {formData.points} pts
                    </span>
                    <span className="text-sm text-neutral-500">
                      Size {formData.size}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    formData.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                    formData.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {formData.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-neutral-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Listing Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span> {formData.category}
                </div>
                <div>
                  <span className="font-medium">Brand:</span> {formData.brand || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Material:</span> {formData.material || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Color:</span> {formData.color || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Images:</span> {images.length}
                </div>
                <div>
                  <span className="font-medium">Tags:</span> {formData.tags.length}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-neutral-50 via-white to-eco-beige">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-4">
            List Your Item
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Share your fashion treasures with the ReWear community and earn points!
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep > step.id
                      ? 'bg-primary-600 text-white'
                      : currentStep === step.id
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium text-neutral-900">
                      {step.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-ghost ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost"
            >
              Save Draft
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Publish Item</span>
                    <CheckCircleIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddItemPage; 