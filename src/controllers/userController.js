import User from "../models/userModel.js";
import asyncHandler from 'express-async-handler';
export const updateLanguagePreference = asyncHandler(async (req, res) => {
      const { language } = req.body;
    
      // Validate the language
      if (!['en', 'hi', 'es'].includes(language)) {
        res.status(400);
        throw new Error('Invalid language');
      }
    
      // Update the user's language preference
      const user = await User.findById(req.user._id);
      user.language = language;
      await user.save();
    
      res.json({ message: 'Language preference updated', user });
    });