const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendVerification,
  checkUsername,
  checkEmail,
  deactivateAccount
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateEmail
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/forgotpassword', validateEmail, forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);
router.get('/check-username/:username', checkUsername);
router.get('/check-email/:email', checkEmail);

// Protected routes
router.use(protect); // All routes after this middleware require authentication

router.get('/me', getMe);
router.put('/me', validateProfileUpdate, updateDetails);
router.put('/updatepassword', validatePasswordChange, updatePassword);
router.post('/logout', logout);
router.post('/resend-verification', resendVerification);
router.delete('/deactivate', deactivateAccount);

module.exports = router; 