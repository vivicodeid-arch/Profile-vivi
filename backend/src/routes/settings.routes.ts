import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const positionEnum = z.enum(["top", "center", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"]);

const updateSettingsSchema = z.object({
  siteName: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  // Contact info
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  contactWaNumber: z.string().optional(),
  // Per-page heroes
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
  // Home about section
  aboutHomeImage: z.string().optional(),
  aboutHomeSubtitle: z.string().optional(),
  aboutHomeTitle: z.string().optional(),
  aboutHomeDesc1: z.string().optional(),
  aboutHomeDesc2: z.string().optional(),
  aboutHomeFeature1: z.string().optional(),
  aboutHomeFeature2: z.string().optional(),
  aboutHomeFeature3: z.string().optional(),
  aboutHomeFeature4: z.string().optional(),
  aboutHomeFeature5: z.string().optional(),
  aboutHomeFeature6: z.string().optional(),
  aboutHomeCtaUrl: z.string().optional(),
  aboutHomeCtaText: z.string().optional(),
  // Home services section
  servicesSectionHomeTitle: z.string().optional(),
  servicesSectionHomeSubtitle: z.string().optional(),
  servicesSectionHomeDescription: z.string().optional(),
  servicesSectionHomeImage: z.string().optional(),
  // CTA slideshow
  ctaSlideImages: z.string().optional(),   // JSON array of image URLs
  ctaSlideInterval: z.string().optional(), // ms between slides
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
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
    const settingsMap = newSettings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ status: "ok", data: settingsMap, message: "Settings updated successfully" });
  } catch (err) { next(err); }
});

export default router;
