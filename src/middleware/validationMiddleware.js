import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ message: errorMessage });
    }
    next();
  };
};



// User validation schemas
//Joi---> Joi is a JavaScript validation library that helps in defining and validating data schemas for objects, arrays, strings, numbers, and other data types

export const userSchemas = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }),
    address: Joi.string()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

};

// Provider validation schemas
// export const providerSchemas = {

//   register: Joi.object({
//     name: Joi.string().required().min(2).max(50),
//     email: Joi.string().email().required(),
//     password: Joi.string().required().min(6),
//     phone: Joi.string().pattern(/^[0-9]{10}$/),
//     experience: Joi.number().min(0),
//     location: Joi.object({
//       type: Joi.string().valid('Point').required(),
//       coordinates: Joi.array().items(Joi.number()).length(2).required()
//     }),
//     address: Joi.string(),
//     categories: Joi.array().items(Joi.string()),
//     services: Joi.array().items(Joi.object({
//       service: Joi.string().required(),
//       price: Joi.number().required().min(0)
//     }))
//   }),
  
//   updateProfile: Joi.object({
//     name: Joi.string().min(2).max(50),
//     phone: Joi.string().pattern(/^[0-9]{10}$/),
//     experience: Joi.number().min(0),
//     location: Joi.object({
//       type: Joi.string().valid('Point'),
//       coordinates: Joi.array().items(Joi.number()).length(2)
//     }),
//     address: Joi.string(),
//     categories: Joi.array().items(Joi.string()),
//     services: Joi.array().items(Joi.object({
//       service: Joi.string().required(),
//       price: Joi.number().required().min(0)
//     }))
//   })
//  };


export const providerSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(50).messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone must be a 10-digit number',
      'string.empty': 'Phone is required'
    }),
    current_location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    area_coverage: Joi.number().required().min(1).max(100).messages({
      'number.base': 'Area coverage must be a number',
      'number.min': 'Area coverage must be at least 1 km',
      'number.max': 'Area coverage cannot exceed 100 km'
    }),
    categories: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.base': 'Categories must be an array',
      'array.min': 'At least one category is required'
    }),
    services: Joi.array().items(Joi.object({
      service: Joi.string().required(),
      price: Joi.number().required().min(0)
    })).min(1).required(),
    photo: Joi.string().uri().required(),
    aadhar_card: Joi.string().required(),
    pan_card: Joi.string().required()
  })
};
 
// Booking validation schemas
export const bookingSchemas = {
  create: Joi.object({
    provider: Joi.string().required().messages({
      'string.empty': 'Provider ID is required',
      'any.required': 'Provider ID is required'
    }),
    service: Joi.string().required().messages({
      'string.empty': 'Service ID is required',
      'any.required': 'Service ID is required'
    }),
    scheduledDate: Joi.date().iso().required().messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.format': 'Scheduled date must be in ISO format',
      'any.required': 'Scheduled date is required'
    }),
    location: Joi.object({
      type: Joi.string().valid('Point').required().messages({
        'any.only': 'Location type must be "Point"',
        'any.required': 'Location type is required'
      }),
      coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
        'array.base': 'Coordinates must be an array',
        'array.length': 'Coordinates must contain exactly 2 numbers [longitude, latitude]',
        'number.base': 'Coordinates must be numbers',
        'any.required': 'Coordinates are required'
      })
    }).required(),
    address: Joi.string().required().messages({
      'string.empty': 'Address is required',
      'any.required': 'Address is required'
    }),
    notes: Joi.string().max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'in-progress', 'completed', 'cancelled').required().messages({
      'any.only': 'Status must be one of: pending, confirmed, in-progress, completed, cancelled',
      'any.required': 'Status is required'
    })
  }),

  updatePrice: Joi.object({
    finalPrice: Joi.number().required().min(0).messages({
      'number.base': 'Final price must be a number',
      'number.min': 'Final price cannot be negative',
      'any.required': 'Final price is required'
    }),
    notes: Joi.string().max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  }),

  payment: Joi.object({
    paymentStatus: Joi.string().valid('pending', 'paid', 'refunded').required().messages({
      'any.only': 'Payment status must be one of: pending, paid, refunded',
      'any.required': 'Payment status is required'
    }),
    paymentMethod: Joi.string().valid('cash', 'online').messages({
      'any.only': 'Payment method must be either cash or online'
    }),
    paymentId: Joi.string().when('paymentMethod', {
      is: 'online',
      then: Joi.string().required().messages({
        'string.empty': 'Payment ID is required for online payments',
        'any.required': 'Payment ID is required for online payments'
      }),
      otherwise: Joi.string().optional()
    })
  })
};

// Category validation schemas
export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(50),
    description: Joi.string(),
    icon: Joi.string()
  })
};

// Service validation schemas
export const serviceSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string(),
    category: Joi.string().required(),
    subcategory: Joi.string().required(),
    basePrice: Joi.number().min(0),
    estimatedTime: Joi.number().min(0)
  })
};