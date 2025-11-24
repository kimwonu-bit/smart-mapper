import { Router } from 'express';
import { MapController } from '../controllers/mapController';
import { ControlController } from '../controllers/controlController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const mapController = new MapController();
const controlController = new ControlController();

/**
 * @swagger
 * /api/maps:
 *   get:
 *     summary: Get all saved maps
 *     tags: [Maps]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of maps
 */
router.get('/maps', mapController.getAllMaps.bind(mapController));

/**
 * @swagger
 * /api/maps/current:
 *   get:
 *     summary: Get current mapping session data
 *     tags: [Maps]
 *     responses:
 *       200:
 *         description: Current map data
 *       404:
 *         description: No active mapping session
 */
router.get('/maps/current', mapController.getCurrentMap.bind(mapController));

/**
 * @swagger
 * /api/maps/{id}:
 *   get:
 *     summary: Get specific map by ID
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Map data
 *       404:
 *         description: Map not found
 */
router.get('/maps/:id', mapController.getMapById.bind(mapController));

/**
 * @swagger
 * /api/maps/{id}/export:
 *   post:
 *     summary: Export map as image
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, svg]
 *     responses:
 *       200:
 *         description: Map image
 *       404:
 *         description: Map not found
 */
router.post('/maps/:id/export', mapController.exportMap.bind(mapController));

/**
 * @swagger
 * /api/maps/{id}:
 *   delete:
 *     summary: Delete a map
 *     tags: [Maps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Map deleted
 *       404:
 *         description: Map not found
 */
router.delete('/maps/:id', authMiddleware, mapController.deleteMap.bind(mapController));

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get robot car current status
 *     tags: [Control]
 *     responses:
 *       200:
 *         description: Robot status
 */
router.get('/status', controlController.getStatus.bind(controlController));

/**
 * @swagger
 * /api/calibrate:
 *   post:
 *     summary: Calibrate sensors
 *     tags: [Control]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referenceDistance:
 *                 type: number
 *               measuredDistance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Calibration started
 */
router.post('/calibrate', authMiddleware, controlController.calibrate.bind(controlController));

/**
 * @swagger
 * /api/stream:
 *   get:
 *     summary: Get camera stream URL
 *     tags: [Stream]
 *     responses:
 *       200:
 *         description: Stream URL
 */
router.get('/stream', controlController.getStreamUrl.bind(controlController));

/**
 * @swagger
 * /api/reset-position:
 *   post:
 *     summary: Reset robot position
 *     tags: [Control]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               theta:
 *                 type: number
 *     responses:
 *       200:
 *         description: Position reset
 */
router.post('/reset-position', authMiddleware, controlController.resetPosition.bind(controlController));

/**
 * @swagger
 * /api/emergency-stop:
 *   post:
 *     summary: Emergency stop the robot
 *     tags: [Control]
 *     responses:
 *       200:
 *         description: Emergency stop executed
 */
router.post('/emergency-stop', controlController.emergencyStop.bind(controlController));

export default router;
