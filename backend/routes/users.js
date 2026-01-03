const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
  getUserWithAllergies, 
  addUserAllergy, 
  removeUserAllergy 
} = require('../helpers/schemaHelpers');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const userWithAllergies = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userWithAllergies._id,
        name: userWithAllergies.name,
        email: userWithAllergies.email,
        allergies: userWithAllergies.allergies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/allergies
// @desc    Get user allergies
// @access  Private
router.get('/allergies', protect, async (req, res) => {
  try {
    const user = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      allergies: user.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/users/allergies
// @desc    Add allergy to user profile
// @access  Private
router.post('/allergies', protect, async (req, res) => {
  try {
    const { allergy, severity } = req.body;

    if (!allergy) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an allergy'
      });
    }

    await addUserAllergy(req.user.id, allergy, severity || 'unknown');
    const user = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Allergy added successfully',
      allergies: user.allergies
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This allergy is already in your list'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/allergies/:allergy
// @desc    Remove allergy from user profile
// @access  Private
router.delete('/allergies/:allergy', protect, async (req, res) => {
  try {
    const allergyToRemove = req.params.allergy;
    await removeUserAllergy(req.user.id, allergyToRemove);
    const user = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Allergy removed successfully',
      allergies: user.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/allergies
// @desc    Update entire allergies list
// @access  Private
router.put('/allergies', protect, async (req, res) => {
  try {
    const { allergies } = req.body;

    if (!Array.isArray(allergies)) {
      return res.status(400).json({
        success: false,
        message: 'Allergies must be an array'
      });
    }

    const Allergy = require('../models/Allergy');
    
    // Remove all existing allergies
    await Allergy.deleteMany({ userId: req.user.id });

    // Add new allergies
    for (const allergen of allergies) {
      await addUserAllergy(req.user.id, allergen, 'unknown');
    }

    const user = await getUserWithAllergies(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Allergies updated successfully',
      allergies: user.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
