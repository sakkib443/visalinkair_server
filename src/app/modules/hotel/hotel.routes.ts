// ===================================================================
// Visalink Air - Hotel Routes
// Hotel module এর API endpoints
// হোটেল মডিউলের API রাউটস
// ===================================================================

import express from 'express';
import { HotelController } from './hotel.controller';
import { HotelValidation } from './hotel.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ==================== Public Routes ====================

// Get active hotels (for frontend listing)
router.get('/active', HotelController.getActiveHotels);

// Get featured hotels (for homepage)
router.get('/featured', HotelController.getFeaturedHotels);

// Get hotel by slug (public detail page)
router.get('/slug/:slug', HotelController.getHotelBySlug);

// Get all hotels (public list)
router.get('/', HotelController.getAllHotels);

// Get single hotel by ID
router.get('/:id', HotelController.getHotelById);

// ==================== Admin Routes ====================

// Create new hotel
router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(HotelValidation.createHotelSchema),
    HotelController.createHotel
);

// Update hotel
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(HotelValidation.updateHotelSchema),
    HotelController.updateHotel
);

// Delete hotel
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    HotelController.deleteHotel
);

export const HotelRoutes = router;
