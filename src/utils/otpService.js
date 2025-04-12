import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOTP = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60000); 
  
  await client.messages.create({
    body: `Your verification code is: ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}` 
  });
  
  return { otp, otpExpires };
};

