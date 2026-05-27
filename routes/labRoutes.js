import express from 'express';
import * as labController from '../controllers/labController.js';
import authHandler from '../middleware/authHandler.js';

const router = express.Router();

router.use(authHandler);

router.post('/requests', labController.createLabRequest);
router.get('/requests', labController.getAllLabRequests);
router.get('/requests/patient/:patientID', labController.getLabRequestsByPatient);
router.post('/results', labController.createLabResult);
router.patch('/requests/:id/status', labController.updateLabRequestStatus);
router.get('/results/patient/:patientID', labController.getLabResultsByPatient);

export default router;