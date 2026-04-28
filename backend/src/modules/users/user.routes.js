const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
} = require('./user.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticateToken);

router.get('/', authorizeRoles('admin'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/role', authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
