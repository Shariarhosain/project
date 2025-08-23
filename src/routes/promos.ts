import express from 'express';
import promoService from '../services/promoService';
import { validate } from '../middleware/validation';
import { createPromoSchema, applyPromoSchema, paginationSchema } from '../schemas/validation';
import { extractGuestToken } from '../utils/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *         value:
 *           type: number
 *         minAmount:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         usageLimit:
 *           type: integer
 *         usageCount:
 *           type: integer
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, EXPIRED]
 */

/**
 * @swagger
 * /api/promos:
 *   get:
 *     summary: Get all promos
 *     tags: [Promos]
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of promos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promo'
 *                 pagination:
 *                   type: object
 */
router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as any;
    const result = await promoService.getPromos(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos:
 *   post:
 *     summary: Create a new promo
 *     tags: [Promos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - validFrom
 *               - validTo
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *               value:
 *                 type: number
 *               minAmount:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               usageLimit:
 *                 type: integer
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Promo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 */
router.post('/', validate(createPromoSchema), async (req, res, next) => {
  try {
    const promo = await promoService.createPromo(req.body);
    res.status(201).json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   get:
 *     summary: Get promo by ID
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID
 *     responses:
 *       200:
 *         description: Promo details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       404:
 *         description: Promo not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const promo = await promoService.getPromoById(req.params.id);
    res.json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/apply:
 *   post:
 *     summary: Apply promo to cart
 *     tags: [Promos]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Bearer token for guest cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promoCode
 *             properties:
 *               promoCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Promo applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promo:
 *                   $ref: '#/components/schemas/Promo'
 *                 cartSubtotal:
 *                   type: number
 *                 discount:
 *                   type: number
 *                 total:
 *                   type: number
 */
router.post('/apply', validate(applyPromoSchema), async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      throw createError('Guest token is required', 401);
    }
    
    const result = await promoService.applyPromoToCart(guestToken, req.body.promoCode);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   put:
 *     summary: Update promo
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               value:
 *                 type: number
 *               minAmount:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               usageLimit:
 *                 type: integer
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Promo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 */
router.put('/:id', async (req, res, next) => {
  try {
    const promo = await promoService.updatePromo(req.params.id, req.body);
    res.json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   delete:
 *     summary: Delete promo
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID
 *     responses:
 *       204:
 *         description: Promo deleted successfully
 *       404:
 *         description: Promo not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await promoService.deletePromo(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
