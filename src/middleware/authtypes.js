import {z} from "zod";
 
export const loginSchema = z.object({
    phone : z.string().min(10).max(10),
    otp : z.string().min(6),
})

export const firsttimeSchema = z.object({
    phone : z.string().min(10).max(10),
})

export const registerSchema = z.object({
    phone : z.string().min(10).max(10),
    name : z.string(),
    email : z.string().email(),
    password : z.string().min(8),
    address : z.string(),
    location : z.object({
        type : z.string(),
        coordinates : z.array(z.number()).length(2)
    }),
    isAdmin : z.boolean(),
    isProvider : z.boolean(),
})

export const requestOTPSchema = z.object({
    phone: z.string().min(10).max(10).regex(/^\d+$/, 'Phone must contain only digits'),
    fullPhone: z.string().optional()
});

export const verifyOTPSchema = z.object({
    phone: z.string().min(10).max(10).regex(/^\d+$/, 'Phone must contain only digits'),
    otp: z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits')
});

export const updateProfileSchema = z.object({
    name : z.string(),
    email : z.string().email().optional(),
    address : z.string().optional(),
})

// Provider validation schemas
export const providerSchemas = {
  create: z.object({
    name: z.string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name cannot exceed 50 characters" }),
    phone: z.string()
      .regex(/^[0-9]{10}$/, { message: "Phone must be a 10-digit number" }),
    current_location: z.object({
      type: z.literal("Point"),
      coordinates: z.array(z.number()).length(2)
    }),
    area_coverage: z.number()
      .min(1, { message: "Area coverage must be at least 1 km" })
      .max(100, { message: "Area coverage cannot exceed 100 km" }),
    categories: z.array(z.string())
      .min(1, { message: "At least one category is required" }),
    services: z.array(
      z.object({
        service: z.string(),
        price: z.number().min(0)
      })
    ).min(1),
    photo: z.string().url(),
    aadhar_card: z.string(),
    pan_card: z.string()
  })
};

// Booking validation schemas
export const bookingSchemas = {
  create: z.object({
    provider: z.string({
      required_error: "Provider ID is required",
      invalid_type_error: "Provider ID must be a string"
    }),
    service: z.string({
      required_error: "Service ID is required",
      invalid_type_error: "Service ID must be a string"
    }),
    scheduledDate: z.string()
      .datetime({ message: "Scheduled date must be in ISO format" }),
    location: z.object({
      type: z.literal("Point", {
        invalid_type_error: "Location type must be 'Point'"
      }),
      coordinates: z.array(z.number())
        .length(2, { message: "Coordinates must contain exactly 2 numbers [longitude, latitude]" })
    }),
    address: z.string({
      required_error: "Address is required",
      invalid_type_error: "Address must be a string"
    }),
    notes: z.string()
      .max(500, { message: "Notes cannot exceed 500 characters" })
      .optional()
  }),

  updateStatus: z.object({
    status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"], {
      required_error: "Status is required",
      invalid_type_error: "Status must be one of: pending, confirmed, in-progress, completed, cancelled"
    })
  }),

  updatePrice: z.object({
    finalPrice: z.number({
      required_error: "Final price is required",
      invalid_type_error: "Final price must be a number"
    }).min(0, { message: "Final price cannot be negative" }),
    notes: z.string()
      .max(500, { message: "Notes cannot exceed 500 characters" })
      .optional()
  }),

  payment: z.object({
    paymentStatus: z.enum(["pending", "paid", "refunded"], {
      required_error: "Payment status is required",
      invalid_type_error: "Payment status must be one of: pending, paid, refunded"
    }),
    paymentMethod: z.enum(["cash", "online"], {
      invalid_type_error: "Payment method must be either cash or online"
    }).optional(),
    paymentId: z.string().optional().refine(
      (val, ctx) => {
        if (ctx.parent.paymentMethod === "online" && !val) {
          return false;
        }
        return true;
      }, 
      { message: "Payment ID is required for online payments" }
    )
  })
};

// Category validation schemas
export const categorySchemas = {
  create: z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional(),
    icon: z.string().optional()
  })
};

// Service validation schemas
export const serviceSchemas = {
  create: z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    category: z.string(),
    subcategory: z.string(),
    basePrice: z.number().min(0).optional(),
    estimatedTime: z.number().min(0).optional()
  })
};
