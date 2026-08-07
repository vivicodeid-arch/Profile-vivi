import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const positionEnum = z.enum(["top", "center", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"]);

const updateSettingsSchema = z.object({
  siteName: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  contactHeroType: z.enum(["gradient", "image", "video"]).optional(),
  contactHeroUrl: z.string().optional(),
  contactHeroTitle: z.string().optional(),
  contactHeroSubtitle: z.string().optional(),
  contactHeroPosition: positionEnum.optional(),
  blogHeroType: z.enum(["gradient", "image", "video"]).optional(),
  blogHeroUrl: z.string().optional(),
  blogHeroTitle: z.string().optional(),
  blogHeroSubtitle: z.string().optional(),
  blogHeroPosition: positionEnum.optional(),
  aboutHeroType: z.enum(["gradient", "image", "video"]).optional(),
  aboutHeroUrl: z.string().optional(),
  aboutHeroTitle: z.string().optional(),
  aboutHeroSubtitle: z.string().optional(),
  aboutHeroPosition: positionEnum.optional(),
  portfolioHeroType: z.enum(["gradient", "image", "video"]).optional(),
  portfolioHeroUrl: z.string().optional(),
  portfolioHeroTitle: z.string().optional(),
  portfolioHeroSubtitle: z.string().optional(),
  portfolioHeroPosition: positionEnum.optional(),
  servicesHeroType: z.enum(["gradient", "image", "video"]).optional(),
  servicesHeroUrl: z.string().optional(),
  servicesHeroTitle: z.string().optional(),
  servicesHeroSubtitle: z.string().optional(),
  servicesHeroPosition: positionEnum.optional(),
  pricingHeroType: z.enum(["gradient", "image", "video"]).optional(),
  pricingHeroUrl: z.string().optional(),
  pricingHeroTitle: z.string().optional(),
  pricingHeroSubtitle: z.string().optional(),
  pricingHeroPosition: positionEnum.optional(),
  ctaSlideImages: z.string().optional(),  // JSON array of image URLs
  ctaSlideInterval: z.string().optional(), // ms between slides
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json({ status: "ok", data: settingsMap });
  } catch (err) { next(err); }
});

router.put("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateSettingsSchema.parse(req.body);
    const updates = Object.entries(validatedData).map(([key, value]) => {
      if (value === undefined) return null;
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }).filter(Boolean);

    if (updates.length > 0) await prisma.$transaction(updates as any);

    const newSettings = await prisma.setting.findMany();
    const settingsMap = newSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ status: "ok", data: settingsMap, message: "Settings updated successfully" });
  } catch (err) { next(err); }
});

export default router;
