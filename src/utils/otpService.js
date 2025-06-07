import User from "../models/userModel.js";
import twilio from "twilio";
import { logger } from "../utils/logger.js";
import TempOTP from "../models/tempOTPmodel.js";

// Twilio client setup with validation
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let twilioClient;

// Only initialize Twilio if credentials are provided
if (twilioAccountSid && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
} else {
  logger.warn("Twilio credentials not provided. OTP SMS will not be sent.");
}

// Generate 6-digit OTP (kept for fallback and development)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number to E.164 format for Twilio
function formatPhoneForTwilio(phoneNumber) {
  // Remove non-digits
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // If it already includes country code (length > 10)
  if (digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }

  // If it's just 10 digits, add India's country code (+91)
  return `+91${digitsOnly}`;
}

export const sendOTP = async (phone, fullPhone) => {
  try {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    // Generate OTP for fallback and database storage
    const otp = generateOTP();
    logger.info(`Generated 6-digit OTP: ${otp} for phone: ${phone}`);
    
    // Set OTP expiry (10 minutes from now)
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);
    
    // Store OTP in temporary collection instead of user collection
    const tempOTPRecord = await TempOTP.findOneAndUpdate(
      { phone }, // Use the parameter name that matches our function signature
      { 
        phone,
        otp: String(otp), // Ensure OTP is saved as string
        otpExpires,
        attempts: 0 // Reset attempts counter
      },
      { 
        upsert: true, 
        new: true
      }
    );
    
    logger.info(`Stored OTP in database: ${tempOTPRecord.otp} for phone: ${phone}`);
    
    // Use fullPhone if provided (with country code), otherwise format the phone number
    const twilioFormattedPhone = fullPhone || formatPhoneForTwilio(phone);
    
    // Send SMS with Twilio Verify Service if client is configured
    if (twilioClient && twilioVerifyServiceSid) {
      try {
        // Wrap Twilio Verify call in a timeout promise for faster failure
        const sendVerifyPromise = new Promise(async (resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Twilio Verify Service timed out'));
          }, 10000); // 10 seconds timeout
          
          try {
            const verification = await twilioClient.verify.v2.services(twilioVerifyServiceSid)
              .verifications
              .create({ 
                to: twilioFormattedPhone, 
                channel: 'sms' 
              });
            
            clearTimeout(timeoutId);
            resolve(verification);
          } catch (err) {
            clearTimeout(timeoutId);
            reject(err);
          }
        });
        
        const verification = await sendVerifyPromise;
        logger.info(`OTP sent via Twilio Verify to ${twilioFormattedPhone}, status: ${verification.status}`);
      } catch (twilioError) {
        logger.error(`Twilio Verify Service failed: ${twilioError.message}`);
        // We don't throw here to allow OTP verification via logs in dev environment
        // Just log the error and continue
      }
    } else {
      logger.warn(`SMS not sent: Twilio Verify Service not configured. OTP for ${phone} is ${otp} (FOR DEVELOPMENT ONLY)`);
    }
    
    return { 
      otp,
      otpExpires,
      success: true, 
      message: 'OTP sent successfully'
    };
    
  } catch (error) {
    logger.error('Error in sendOTP:', error);
    throw new Error(`Failed to send verification code: ${error.message}`);
  }
};


export const verifyOTP = async (phone, otpCode, fullPhone) => {
  try {
    if (!phone || !otpCode) {
      throw new Error("Phone number and OTP are required");
    }

    // Ensure OTP is a string for consistent comparison
    const otpString = String(otpCode);
    
    // Log the verification attempt details
    logger.info(`Attempting to verify OTP: ${otpString} for phone: ${phone}`);

    // Use fullPhone if provided (with country code), otherwise format the phone number
    const twilioFormattedPhone = fullPhone || formatPhoneForTwilio(phone);

    // First try Twilio Verify Service if available
    let twilioVerified = false;
    if (twilioClient && twilioVerifyServiceSid) {
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(twilioVerifyServiceSid)
          .verificationChecks.create({
            to: twilioFormattedPhone,
            code: otpString,
          });

        logger.info(
          `Twilio verification check for ${twilioFormattedPhone}: ${verificationCheck.status}`
        );

        if (verificationCheck.status === "approved") {
          twilioVerified = true;
          return { success: true, verified: true, method: "twilio" };
        } else {
          // If Twilio verification fails, fall back to database verification
          logger.warn(
            `Twilio verification failed for ${phone}, falling back to database verification`
          );
        }
      } catch (twilioError) {
        logger.error(`Twilio verification error: ${twilioError.message}`);
        // Fall back to database verification
      }
    }

    // Fallback to database OTP verification - now using TempOTP collection
    const tempOTP = await TempOTP.findOne({ phone });
    
    // Log the found TempOTP record for debugging
    logger.info(`TempOTP record found: ${JSON.stringify(tempOTP || 'null')}`);
    
    if (!tempOTP) {
      return { 
        success: false, 
        verified: false, 
        error: "No active OTP request found. Please request a new OTP." 
      };
    }

    // Check if OTP is expired
    if (tempOTP.otpExpires < new Date()) {
      // Clean up expired OTP record
      await TempOTP.deleteOne({ phone });
      return { 
        success: false, 
        verified: false, 
        error: "OTP has expired. Please request a new one." 
      };
    }

    // Log OTP comparison for debugging
    logger.info(`Comparing OTPs - Stored: '${tempOTP.otp}' (${typeof tempOTP.otp}), Entered: '${otpString}' (${typeof otpString})`);
    
    // Check if OTP matches - use String for consistent comparison
    if (String(tempOTP.otp) === otpString) {
      // OTP is valid, will be deleted by the calling function
      logger.info(`OTP verified successfully using database for phone: ${phone}`);
      return { 
        success: true, 
        verified: true, 
        method: "database" 
      };
    } else {
      // Increment attempts counter
      await TempOTP.updateOne(
        { phone }, 
        { $inc: { attempts: 1 } }
      );
      
      // Check if too many attempts
      const updatedTempOTP = await TempOTP.findOne({ phone });
      if (updatedTempOTP && updatedTempOTP.attempts >= 5) {
        // Delete OTP if too many failed attempts
        await TempOTP.deleteOne({ phone });
        return {
          success: false,
          verified: false,
          error: "Too many failed attempts. Please request a new OTP."
        };
      }
      
      logger.warn(`Invalid OTP: expected '${tempOTP.otp}', got '${otpString}' for phone ${phone}`);
      return {
        success: false,
        verified: false,
        error: "Invalid OTP. Please try again."
      };
    }
  } catch (error) {
    logger.error(`Error in verifyOTP: ${error.message}`, error);
    return { success: false, verified: false, error: error.message };
  }
};

//this is written in proper error handling code , afterwards we can remove error handling