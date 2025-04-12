// import asyncHandler from 'express-async-handler';
// import Provider from '../models/providerModel.js';
// import Service from '../models/serviceModel.js';
// import User from '../models/userModel.js';
// import { clearCache } from '../config/redis.js';

// // @desc    Get all providers
// // @route   GET /api/providers
// // @access  Public
// export const getProviders = asyncHandler(async (req, res) => {
//   const providers = await Provider.find({ isActive: true })
//     .select('-password')
//     .populate('categories', 'name');
    
//   res.json(providers);
// });

// // @desc    Get provider by ID
// // @route   GET /api/providers/:id
// // @access  Public
// export const getProviderById = asyncHandler(async (req, res) => {
//   const provider = await Provider.findById(req.params.id)
//     .select('-password')
//     .populate('categories', 'name')
//     .populate('services.service', 'name description');
  
//   if (provider) {
//     res.json(provider);
//   } else {
//     res.status(404);
//     throw new Error('Provider not found');
//   }
// });

// // @desc    Update provider profile
// // @route   PUT /api/providers/profile
// // @access  Private/Provider
// export const updateProviderProfile = asyncHandler(async (req, res) => {
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }

//   const { 
//     name, 
//     phone, 
//     experience, 
//     location, 
//     address, 
//     categories,
//     services,
//     availability,
//     availableHours
//   } = req.body;

//   // Update provider fields
//   provider.name = name || provider.name;
//   provider.phone = phone || provider.phone;
  
//   if (experience !== undefined) {
//     provider.experience = experience;
//   }
  
//   if (location) {
//     provider.location = location;
//   }
  
//   provider.address = address || provider.address;
  
//   if (categories) {
//     provider.categories = categories;
//   }
  
//   if (services) {
//     // Validate that all services exist
//     for (const serviceItem of services) {
//       const serviceExists = await Service.findById(serviceItem.service);
//       if (!serviceExists) {
//         res.status(404);
//         throw new Error(`Service with ID ${serviceItem.service} not found`);
//       }
//     }
    
//     provider.services = services;
//   }
  
//   if (availability) {
//     provider.availability = availability;
//   }
  
//   if (availableHours) {
//     provider.availableHours = availableHours;
//   }

//   const updatedProvider = await provider.save();
  
//   // Also update the user record if name changed
//   if (name) {
//     await User.findByIdAndUpdate(req.user._id, { name });
//   }
  
//   // Clear cache
//   await clearCache(`__express__/api/providers/${provider._id}*`);
  
//   res.json({
//     _id: updatedProvider._id,
//     name: updatedProvider.name,
//     phone: updatedProvider.phone,
//     experience: updatedProvider.experience,
//     location: updatedProvider.location,
//     address: updatedProvider.address,
//     categories: updatedProvider.categories,
//     services: updatedProvider.services,
//     rating: updatedProvider.rating,
//     numReviews: updatedProvider.numReviews,
//     availability: updatedProvider.availability,
//     availableHours: updatedProvider.availableHours
//   });
// });

// // @desc    Get providers by service
// // @route   GET /api/providers/service/:serviceId
// // @access  Public
// export const getProvidersByService = asyncHandler(async (req, res) => {
//   const { lat, lng, radius = 10, sort = 'distance' } = req.query;
  
//   // Validate service exists
//   const serviceExists = await Service.findById(req.params.serviceId);
//   if (!serviceExists) {
//     res.status(404);
//     throw new Error('Service not found');
//   }
  
//   let query = {
//     isActive: true,
//     isVerified: true,
//     'services.service': req.params.serviceId
//   };
  
//   // If location is provided, find providers within radius
//   if (lat && lng) {
//     query.location = {
//       $near: {
//         $geometry: {
//           type: 'Point',
//           coordinates: [parseFloat(lng), parseFloat(lat)]
//         },
//         $maxDistance: parseInt(radius) * 1000 // Convert km to meters
//       }
//     };
//   }
  
//   let providers = await Provider.find(query)
//     .select('-password')
//     .populate('services.service', 'name description');
  
//   // If sort parameter is provided, sort results accordingly
//   if (sort === 'price') {
//     // Sort by price for the specific service
//     providers.sort((a, b) => {
//       const aService = a.services.find(s => s.service._id.toString() === req.params.serviceId);
//       const bService = b.services.find(s => s.service._id.toString() === req.params.serviceId);
//       return aService.price - bService.price;
//     });
//   } else if (sort === 'rating') {
//     // Sort by rating
//     providers.sort((a, b) => b.rating - a.rating);
//   } else if (sort === 'experience') {
//     // Sort by experience
//     providers.sort((a, b) => b.experience - a.experience);
//   }
//   // Default sort is by distance which is handled by MongoDB $near
  
//   // Add the specific service price to each provider
//   providers = providers.map(provider => {
//     const providerObj = provider.toObject();
//     const serviceInfo = provider.services.find(
//       s => s.service._id.toString() === req.params.serviceId
//     );
    
//     providerObj.servicePrice = serviceInfo ? serviceInfo.price : null;
    
//     return providerObj;
//   });
  
//   res.json(providers);
// });

// // @desc    Get providers by category
// // @route   GET /api/providers/category/:categoryId
// // @access  Public
// export const getProvidersByCategory = asyncHandler(async (req, res) => {
//   const { lat, lng, radius = 10 } = req.query;
  
//   let query = {
//     isActive: true,
//     isVerified: true,
//     categories: req.params.categoryId
//   };
  
//   // If location is provided, find providers within radius
//   if (lat && lng) {
//     query.location = {
//       $near: {
//         $geometry: {
//           type: 'Point',
//           coordinates: [parseFloat(lng), parseFloat(lat)]
//         },
//         $maxDistance: parseInt(radius) * 1000 // Convert km to meters
//       }
//     };
//   }
  
//   const providers = await Provider.find(query)
//     .select('-password')
//     .populate('categories', 'name');
  
//   res.json(providers);
// });

// // @desc    Add service to provider
// // @route   POST /api/providers/services
// // @access  Private/Provider
// export const addProviderService = asyncHandler(async (req, res) => {
//   const { service, price } = req.body;
  
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   // Validate service exists
//   const serviceExists = await Service.findById(service);
//   if (!serviceExists) {
//     res.status(404);
//     throw new Error('Service not found');
//   }
  
//   // Check if service already exists for this provider
//   const serviceAlreadyAdded = provider.services.find(
//     s => s.service.toString() === service
//   );
  
//   if (serviceAlreadyAdded) {
//     res.status(400);
//     throw new Error('Service already added to provider');
//   }
  
//   // Add service to provider
//   provider.services.push({
//     service,
//     price
//   });
  
//   // Add category to provider if not already added
//   if (!provider.categories.includes(serviceExists.category)) {
//     provider.categories.push(serviceExists.category);
//   }
  
//   await provider.save();
  
//   // Clear cache
//   await clearCache(`__express__/api/providers/${provider._id}*`);
  
//   res.status(201).json(provider);
// });

// // @desc    Update provider service
// // @route   PUT /api/providers/services/:serviceId
// // @access  Private/Provider
// export const updateProviderService = asyncHandler(async (req, res) => {
//   const { price, isActive } = req.body;
  
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   // Find the service in provider's services
//   const serviceIndex = provider.services.findIndex(
//     s => s.service.toString() === req.params.serviceId
//   );
  
//   if (serviceIndex === -1) {
//     res.status(404);
//     throw new Error('Service not found for this provider');
//   }
  
//   // Update service
//   if (price !== undefined) {
//     provider.services[serviceIndex].price = price;
//   }
  
//   if (isActive !== undefined) {
//     provider.services[serviceIndex].isActive = isActive;
//   }
  
//   await provider.save();
  
//   // Clear cache
//   await clearCache(`__express__/api/providers/${provider._id}*`);
  
//   res.json(provider);
// });


// export const getNearbyProviders = async (req, res) => {
//   const { longitude, latitude, maxDistance = 4000 } = req.query; // maxDistance in meters

//   try {
//     const providers = await Provider.find({
//       location: {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [parseFloat(longitude), parseFloat(latitude)],
//           },
//           $maxDistance: maxDistance,
//         },
//       },
//     });

//     res.status(200).json(providers);
//   } catch (error) {
//     logger.error('Error fetching nearby providers:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // @desc    Remove service from provider
// // @route   DELETE /api/providers/services/:serviceId
// // @access  Private/Provider
// export const removeProviderService = asyncHandler(async (req, res) => {
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   // Instead of removing, mark as inactive
//   const serviceIndex = provider.services.findIndex(
//     s => s.service.toString() === req.params.serviceId
//   );
  
//   if (serviceIndex === -1) {
//     res.status(404);
//     throw new Error('Service not found for this provider');
//   }
  
//   provider.services[serviceIndex].isActive = false;
  
//   await provider.save();
  
//   // Clear cache
//   await clearCache(`__express__/api/providers/${provider._id}*`);
  
//   res.json({ message: 'Service removed from provider' });
// });



import asyncHandler from 'express-async-handler';
import Provider from '../models/providerModel.js';
import Service from '../models/serviceModel.js';
import Category from '../models/categoryModel.js';
import { clearCache } from '../config/redis.js';

// @desc    Get all active providers
// @route   GET /api/providers
// @access  Public
export const getProviders = asyncHandler(async (req, res) => {
  const { service, category, lat, lng, radius = 10, sort } = req.query;
  
  let query = { isActive: true };
  
  // Filter by service
  if (service) {
    query['services.service'] = service;
    query['services.isActive'] = true;
  }
  
  // Filter by category
  if (category) {
    query.categories = category;
  }
  
  // Geo-filtering
  if (lat && lng) {
    query.current_location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000 // Convert km to meters
      }
    };
  }
  
  let providers = await Provider.find(query)
    .populate('categories', 'name icon')
    .populate('services.service', 'name description');
  
  // Sorting
  if (sort === 'rating') {
    providers.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'distance' && lat && lng) {
    // Already sorted by $near
  } else {
    // Default sort by most reviewed
    providers.sort((a, b) => b.numReviews - a.numReviews);
  }
  
  res.json(providers);
});

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id)
    .populate('categories', 'name icon')
    .populate('services.service', 'name description basePrice');
  
  if (!provider || !provider.isActive) {
    res.status(404);
    throw new Error('Provider not found');
  }
  
  res.json(provider);
});

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private/Provider
export const updateProviderProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.provider._id);
  
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  
  const { 
    name,
    current_location,
    area_coverage,
    photo
  } = req.body;
  
  // Update fields
  if (name) provider.name = name;
  if (current_location) {
    provider.current_location = {
      type: 'Point',
      coordinates: current_location
    };
  }
  if (area_coverage) provider.area_coverage = area_coverage;
  if (photo) provider.photo = photo;
  
  const updatedProvider = await provider.save();
  await clearCache(`providers_${provider._id}`);
  
  res.json({
    _id: updatedProvider._id,
    name: updatedProvider.name,
    photo: updatedProvider.photo,
    current_location: updatedProvider.current_location,
    area_coverage: updatedProvider.area_coverage,
    rating: updatedProvider.rating
  });
});

// @desc    Add service to provider
// @route   POST /api/providers/services
// @access  Private/Provider
export const addProviderService = asyncHandler(async (req, res) => {
  const { service: serviceId, price, duration } = req.body;
  
  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  // Check if already offering this service
  const existingService = req.provider.services.find(
    s => s.service.toString() === serviceId
  );
  
  if (existingService) {
    res.status(400);
    throw new Error('Service already added');
  }
  
  // Add service
  req.provider.services.push({
    service: serviceId,
    price,
    duration
  });
  
  // Add category if not already present
  if (!req.provider.categories.includes(service.category)) {
    req.provider.categories.push(service.category);
  }
  
  await req.provider.save();
  await clearCache(`providers_${req.provider._id}`);
  
  res.status(201).json({
    service: serviceId,
    price,
    duration
  });
});

// @desc    Update provider service
// @route   PUT /api/providers/services/:serviceId
// @access  Private/Provider
export const updateProviderService = asyncHandler(async (req, res) => {
  const { price, duration, isActive } = req.body;
  const { serviceId } = req.params;
  
  const serviceIndex = req.provider.services.findIndex(
    s => s.service.toString() === serviceId
  );
  
  if (serviceIndex === -1) {
    res.status(404);
    throw new Error('Service not found for this provider');
  }
  
  // Update fields
  if (price !== undefined) {
    req.provider.services[serviceIndex].price = price;
  }
  if (duration !== undefined) {
    req.provider.services[serviceIndex].duration = duration;
  }
  if (isActive !== undefined) {
    req.provider.services[serviceIndex].isActive = isActive;
  }
  
  await req.provider.save();
  await clearCache(`providers_${req.provider._id}`);
  
  res.json(req.provider.services[serviceIndex]);
});

// @desc    Get nearby providers
// @route   GET /api/providers/nearby
// @access  Public
export const getNearbyProviders = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, service } = req.query;
  
  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }
  
  const query = {
    isActive: true,
    current_location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000
      }
    }
  };
  
  if (service) {
    query['services.service'] = service;
    query['services.isActive'] = true;
  }
  
  const providers = await Provider.find(query)
    .select('name photo current_location services rating')
    .populate('services.service', 'name');
  
  res.json(providers);
});

// @desc    Remove service from provider (mark as inactive)
// @route   DELETE /api/providers/services/:serviceId
// @access  Private/Provider
export const removeProviderService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const serviceIndex = req.provider.services.findIndex(
    s => s.service.toString() === serviceId && s.isActive
  );

  if (serviceIndex === -1) {
    res.status(404);
    throw new Error('Active service not found for this provider');
  }

  // Mark as inactive instead of removing
  req.provider.services[serviceIndex].isActive = false;
  
  await req.provider.save();
  await clearCache(`providers_${req.provider._id}`);

  res.json({ 
    message: 'Service marked as inactive',
    serviceId
  });
});

// @desc    Get providers by category
// @route   GET /api/providers/category/:categoryId
// @access  Public
export const getProvidersByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { lat, lng, radius = 10, sort } = req.query;

  // Validate category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  let query = { 
    isActive: true,
    categories: categoryId 
  };

  // Add geo-filter if coordinates provided
  if (lat && lng) {
    query.current_location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000
      }
    };
  }

  let providers = await Provider.find(query)
    .populate('categories', 'name icon')
    .populate({
      path: 'services.service',
      match: { isActive: true },
      select: 'name description'
    });

  // Filter out providers with no active services
  providers = providers.filter(provider => 
    provider.services.some(service => service.isActive)
  );

  // Sorting
  if (sort === 'rating') {
    providers.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'distance' && lat && lng) {
    // Already sorted by $near
  } else {
    // Default sort by experience
    providers.sort((a, b) => b.experience - a.experience);
  }

  res.json(providers);
});

// @desc    Get providers by service
// @route   GET /api/providers/service/:serviceId
// @access  Public
export const getProvidersByService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { lat, lng, radius = 10, minRating, maxPrice } = req.query;

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  let query = {
    isActive: true,
    'services.service': serviceId,
    'services.isActive': true
  };

  // Add filters
  if (minRating) {
    query.rating = { $gte: parseFloat(minRating) };
  }
  if (maxPrice) {
    query['services.price'] = { $lte: parseFloat(maxPrice) };
  }

  // Add geo-filter
  if (lat && lng) {
    query.current_location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000
      }
    };
  }

  let providers = await Provider.find(query)
    .populate('categories', 'name')
    .populate('services.service', 'name description');

  // Enhance response with service-specific info
  providers = providers.map(provider => {
    const providerObj = provider.toObject();
    const serviceInfo = provider.services.find(
      s => s.service._id.toString() === serviceId
    );
    
    providerObj.serviceDetails = {
      price: serviceInfo.price,
      duration: serviceInfo.duration
    };
    
    return providerObj;
  });

  res.json(providers);
});

// @desc    Get provider's own services
// @route   GET /api/providers/my-services
// @access  Private/Provider
export const getMyServices = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.provider._id)
    .populate('services.service', 'name description category')
    .populate('categories', 'name');

  const activeServices = provider.services.filter(service => service.isActive);

  res.json({
    services: activeServices,
    categories: provider.categories
  });
});

// @desc    Get provider dashboard data
// @route   GET /api/providers/dashboard
// @access  Private/Provider
export const getProviderDashboard = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.provider._id)
    .select('name photo rating numReviews services')
    .populate('services.service', 'name');
  
  res.json({
    profile: {
      name: provider.name,
      photo: provider.photo,
      rating: provider.rating,
      numReviews: provider.numReviews
    },
    services: provider.services
  });
});