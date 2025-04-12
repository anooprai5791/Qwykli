import { sendSMS } from './src/utils/sms.js';
import dotenv from 'dotenv';

dotenv.config();

const testSendSMS = async () => {
  try {
    const to = process.env.TEST_PHONE_NUMBER; // Add a valid phone number in E.164 format (e.g., +1234567890)
    const body = 'Thanks for using Our Qwikli App...! .. YOUR BOOKING HAS BEEN CONFIRMED,CONGRATS!!!';

    if (!to) {
      throw new Error('TEST_PHONE_NUMBER is not defined in .env');
    }

    console.log('Sending SMS to:', to);

    const response = await sendSMS(to, body);
    console.log('SMS sent successfully:', response);
  } catch (error) {
    console.error('SMS Test Failed:', error);
  }
};

testSendSMS();
