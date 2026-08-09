import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

const router = Router();

const featureSchema = z.object({
  text: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  included: z.boolean().default(true),
  order: z.number().default(0),
});

const planSchema = z.object({
  name: z.string().min(1),
  label: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  subtitle: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  category: z.enum(["individual", "team"]).default("individual"),
  priceMonthly: z.number().nullable().optional(),
  priceYearly: z.number().nullable().optional(),
  currency: z.string().default("IDR"),
  highlighted: z.boolean().default(false),
  ctaLabel: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  ctaUrl: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  active: z.boolean().default(true),
  order: z.number().default(0),
  features: z.array(featureSchema).optional(),
});

// GET /api/pricing - Public
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { features: { orderBy: { order: "asc" } } },
    });
    res.json({ status: "ok", data: plans });
  } catch (err) { next(err); }
});

// GET /api/pricing/all - Admin (include inactive)
router.get("/all", authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { order: "asc" },
      include: { features: { orderBy: { order: "asc" } } },
    });
    res.json({ status: "ok", data: plans });
  } catch (err) { next(err); }
});

// POST /api/pricing - Admin
router.post("/", authenticate, validate(planSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { features, ...planData } = req.body;
    const plan = await prisma.pricingPlan.create({
      data: {
        ...planData,
        features: features ? { create: features } : undefined,
      },
      include: { features: { orderBy: { order: "asc" } } },
    });
    res.status(201).json({ status: "ok", data: plan });
  } catch (err) { next(err); }
});

// PUT /api/pricing/:id - Admin
router.put("/:id", authenticate, validate(planSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { features, ...planData } = req.body;
    // Update plan data
    await prisma.pricingPlan.update({
      where: { id: req.params.id },
      data: planData,
    });
    // Replace features if provided
    if (features !== undefined) {
      await prisma.pricingFeature.deleteMany({ where: { planId: req.params.id } });
      if (features.length > 0) {
        await prisma.pricingFeature.createMany({
          data: features.map((f: any) => ({ ...f, planId: req.params.id })),
        });
      }
    }
    const updated = await prisma.pricingPlan.findUnique({
      where: { id: req.params.id },
      include: { features: { orderBy: { order: "asc" } } },
    });
    res.json({ status: "ok", data: updated });
  } catch (err) { next(new AppError(404, "Pricing plan not found")); }
});

// DELETE /api/pricing/:id - Admin
router.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.pricingPlan.delete({ where: { id: req.params.id } });
    res.json({ status: "ok", message: "Pricing plan deleted" });
  } catch (err) { next(new AppError(404, "Pricing plan not found")); }
});

export default router;
