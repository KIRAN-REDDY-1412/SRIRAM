import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as emergencyController from '../controllers/emergencyController.js';
import * as volunteerController from '../controllers/volunteerController.js';
import * as assignmentController from '../controllers/assignmentController.js';
import * as hospitalController from '../controllers/hospitalController.js';
import * as shelterController from '../controllers/shelterController.js';
import * as resourceController from '../controllers/resourceController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getAIPriorityPrediction } from '../services/aiService.js';

const router = Router();

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/users/me', authenticateToken, authController.me);

// Emergency Routes
router.post('/emergencies', emergencyController.createEmergency);
router.get('/emergencies', emergencyController.getEmergencies);
router.get('/emergencies/:id', emergencyController.getEmergencyById);
router.patch('/emergencies/:id/status', emergencyController.updateEmergencyStatus);

// Volunteer Routes
router.get('/volunteers', volunteerController.getVolunteers);
router.patch('/volunteers/availability', authenticateToken, volunteerController.updateAvailability);
router.patch('/volunteers/location', authenticateToken, volunteerController.updateLocation);

// Assignment Routes
router.post('/assignments', assignmentController.createAssignment);
router.patch('/assignments/:id/status', assignmentController.updateAssignmentStatus);

// Hospital Routes
router.get('/hospitals', hospitalController.getHospitals);
router.post('/hospitals', hospitalController.createHospital);

// Shelter Routes
router.get('/shelters', shelterController.getShelters);
router.post('/shelters', shelterController.createShelter);

// Resource Routes
router.get('/resources', resourceController.getResources);
router.post('/resources', resourceController.createResource);
router.patch('/resources/:id', resourceController.updateResource);

// Dashboard Statistics Route
router.get('/dashboard/statistics', dashboardController.getStatistics);

// AI Direct Proxy Endpoint
router.post('/ai/predict-priority', async (req, res) => {
  try {
    const result = await getAIPriorityPrediction(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
