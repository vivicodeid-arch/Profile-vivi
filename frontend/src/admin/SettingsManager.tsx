import { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "../store/settingsStore";
import api from "../services/api";
import { Save, Image as ImageIcon, Upload, X, Video, Monitor } from "lucide-react";

type HeroPosition = "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right";

const POSITIONS: { value: HeroPosition; label: string }[] = [
  { value: "top-left",     label: "↖" },
  { value: "top",          label: "↑" },
  { value: "top-right",    label: "↗" },
  { value: "left",         label: "←" },
  { value: "center",       label: "·" },
  { value: "right",        label: "→" },
  { value: "bottom-left",  label: "↙" },
  { value: "bottom",       label: "↓" },
  { value: "bottom-right", label: "↘" },
];

const POSITION_CSS: Record<HeroPosition, string> = {
  "top-left":     "top left",
  "top":          "top center",
  "top-right":    "top right",
  "left":         "center left",
  "center":       "center center",
  "right":        "center right",
  "bottom-left":  "bottom left",
  "bottom":       "bottom center",
  "bottom-right": "bottom right",
};

export default function SettingsManager() {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    siteName: "",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",
    contactHeroType: "gradient",
    contactHeroUrl: "",
    contactHeroTitle: "",
    contactHeroSubtitle: "",
    contactHeroPosition: "center",
    blogHeroType: "gradient",
    blogHeroUrl: "",
    blogHeroTitle: "",
    blogHeroSubtitle: "",
    blogHeroPosition: "center",
    aboutHeroType: "gradient",
    aboutHeroUrl: "",
    aboutHeroTitle: "",
    aboutHeroSubtitle: "",
    aboutHeroPosition: "center",
    portfolioHeroType: "gradient",
    portfolioHeroUrl: "",
    portfolioHeroTitle: "",
    portfolioHeroSubtitle: "",
    portfolioHeroPosition: "center",
    servicesHeroType: "gradient",
    servicesHeroUrl: "",
    servicesHeroTitle: "",
    servicesHeroSubtitle: "",
    servicesHeroPosition: "center",
    pricingHeroType: "gradient",
    pricingHeroUrl: "",
    pricingHeroTitle: "",
    pricingHeroSubtitle: "",
    pricingHeroPosition: "center",
    ctaSlideImages: "[]",
    ctaSlideInterval: "4000",
  });
  const [isSaving, setIsSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const contactHeroInputRef = useRef<HTMLInputElement>(null);
  const blogHeroInputRef = useRef<HTMLInputElement>(null);
  const aboutHeroInputRef = useRef<HTMLInputElement>(null);
  const portfolioHeroInputRef = useRef<HTMLInputElement>(null);
  const servicesHeroInputRef = useRef<HTMLInputElement>(null);
  const pricingHeroInputRef = useRef<HTMLInputElement>(null);
  const ctaSlideInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        heroImageUrl: settings.heroImageUrl || "",
        contactHeroType: settings.contactHeroType || "gradient",
        contactHeroUrl: settings.contactHeroUrl || "",
        contactHeroTitle: settings.contactHeroTitle || "",
        contactHeroSubtitle: settings.contactHeroSubtitle || "",
        contactHeroPosition: settings.contactHeroPosition || "center",
        blogHeroType: settings.blogHeroType || "gradient",
        blogHeroUrl: settings.blogHeroUrl || "",
        blogHeroTitle: settings.blogHeroTitle || "",
        blogHeroSubtitle: settings.blogHeroSubtitle || "",
        blogHeroPosition: settings.blogHeroPosition || "center",
        aboutHeroType: settings.aboutHeroType || "gradient",
        aboutHeroUrl: settings.aboutHeroUrl || "",
        aboutHeroTitle: settings.aboutHeroTitle || "",
        aboutHeroSubtitle: settings.aboutHeroSubtitle || "",
        aboutHeroPosition: settings.aboutHeroPosition || "center",
        portfolioHeroType: settings.portfolioHeroType || "gradient",
        portfolioHeroUrl: settings.portfolioHeroUrl || "",
        portfolioHeroTitle: settings.portfolioHeroTitle || "",
        portfolioHeroSubtitle: settings.portfolioHeroSubtitle || "",
        portfolioHeroPosition: settings.portfolioHeroPosition || "center",
        servicesHeroType: settings.servicesHeroType || "gradient",
        servicesHeroUrl: settings.servicesHeroUrl || "",
        servicesHeroTitle: settings.servicesHeroTitle || "",
        servicesHeroSubtitle: settings.servicesHeroSubtitle || "",
        servicesHeroPosition: settings.servicesHeroPosition || "center",
        pricingHeroType: settings.pricingHeroType || "gradient",
        pricingHeroUrl: settings.pricingHeroUrl || "",
        pricingHeroTitle: settings.pricingHeroTitle || "",
        pricingHeroSubtitle: settings.pricingHeroSubtitle || "",
        pricingHeroPosition: settings.pricingHeroPosition || "center",
        ctaSlideImages: settings.ctaSlideImages || "[]",
        ctaSlideInterval: settings.ctaSlideInterval || "4000",
      });
    }
  }, [settings]);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl" | "heroImageUrl" | "contactHeroUrl" | "blogHeroUrl" | "aboutHeroUrl" | "portfolioHeroUrl" | "servicesHeroUrl" | "pricingHeroUrl" | "ctaSlideAdd"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("alt", field);
      const response = await api.post("/media", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status === "ok") {
        setFormData((prev) => ({ ...prev, [field]: response.data.data.url }));
        alert("Upload successful");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload file.");
    }
    if (field === "logoUrl" && logoInputRef.current) logoInputRef.current.value = "";
    if (field === "faviconUrl" && faviconInputRef.current) faviconInputRef.current.value = "";
    if (field === "heroImageUrl" && heroInputRef.current) heroInputRef.current.value = "";
    if (field === "contactHeroUrl" && contactHeroInputRef.current) contactHeroInputRef.current.value = "";
    if (field === "blogHeroUrl" && blogHeroInputRef.current) blogHeroInputRef.current.value = "";
    if (field === "aboutHeroUrl" && aboutHeroInputRef.current) aboutHeroInputRef.current.value = "";
    if (field === "portfolioHeroUrl" && portfolioHeroInputRef.current) portfolioHeroInputRef.current.value = "";
    if (field === "servicesHeroUrl" && servicesHeroInputRef.current) servicesHeroInputRef.current.value = "";
    if (field === "pricingHeroUrl" && pricingHeroInputRef.current) pricingHeroInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      alert("Settings saved successfully.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const pos = (formData.contactHeroPosition || "center") as HeroPosition;

  if (isLoading && !formData.siteName && !formData.logoUrl && !formData.faviconUrl) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your site configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData((p) => ({ ...p, siteName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="VivIDev.id"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["logoUrl", "faviconUrl", "heroImageUrl"] as const).map((field) => {
              const labels = { logoUrl: "Logo", faviconUrl: "Favicon", heroImageUrl: "Homepage Hero Image" };
              const refs = { logoUrl: logoInputRef, faviconUrl: faviconInputRef, heroImageUrl: heroInputRef };
              const ref = refs[field];
              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{labels[field]}</label>
                  <div className="flex flex-col gap-2">
                    {formData[field] ? (
                      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                        <img src={formData[field]} alt={labels[field]} className="max-h-16 max-w-full object-contain" />
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, [field]: "" }))} className="absolute top-1 right-1 p-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <input ref={ref} type="file" accept="image/*" onChange={(e) => handleUpload(e, field)} className="hidden" />
                    <button type="button" onClick={() => ref.current?.click()} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Page Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Contact Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the Contact page.</p>

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.contactHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((p) => ({ ...p, contactHeroType: type, contactHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {/* Upload area */}
          {formData.contactHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.contactHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.contactHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.contactHeroType === "image" ? (
                    <img
                      src={formData.contactHeroUrl}
                      alt="Contact Hero"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[pos] }}
                    />
                  ) : (
                    <video src={formData.contactHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[pos] }} />
                  )}
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, contactHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  {/* Position indicator overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {pos.replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div
                  className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => contactHeroInputRef.current?.click()}
                >
                  {formData.contactHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.contactHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={contactHeroInputRef} type="file"
                accept={formData.contactHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "contactHeroUrl")} className="hidden" />
              {!formData.contactHeroUrl && (
                <button type="button" onClick={() => contactHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.contactHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {/* Gradient preview */}
          {formData.contactHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-primary-900 to-primary-700 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.contactHeroTitle || "Hubungi Kami"}</p>
                <p className="text-primary-200 text-xs mt-0.5">{formData.contactHeroSubtitle || "Ada pertanyaan atau ingin berdiskusi tentang proyek Anda?"}</p>
              </div>
            </div>
          )}

          {/* Position picker — hanya untuk image/video */}
          {formData.contactHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.contactHeroPosition === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value.replace("-", " ")}
                      onClick={() => setFormData((p) => ({ ...p, contactHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive
                          ? "bg-primary-500 text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Pilih titik fokus untuk crop — posisi: <span className="font-medium">{pos.replace("-", " ")}</span></p>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.contactHeroTitle}
                onChange={(e) => setFormData((p) => ({ ...p, contactHeroTitle: e.target.value }))}
                placeholder="Hubungi Kami"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.contactHeroSubtitle}
                onChange={(e) => setFormData((p) => ({ ...p, contactHeroSubtitle: e.target.value }))}
                placeholder="Ada pertanyaan atau ingin berdiskusi..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* Blog Page Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Blog Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the Blog page.</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.blogHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((p) => ({ ...p, blogHeroType: type, blogHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {formData.blogHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.blogHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.blogHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.blogHeroType === "image" ? (
                    <img src={formData.blogHeroUrl} alt="Blog Hero" className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[(formData.blogHeroPosition || "center") as HeroPosition] }} />
                  ) : (
                    <video src={formData.blogHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[(formData.blogHeroPosition || "center") as HeroPosition] }} />
                  )}
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, blogHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(formData.blogHeroPosition || "center").replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => blogHeroInputRef.current?.click()}>
                  {formData.blogHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.blogHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={blogHeroInputRef} type="file"
                accept={formData.blogHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "blogHeroUrl")} className="hidden" />
              {!formData.blogHeroUrl && (
                <button type="button" onClick={() => blogHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.blogHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {formData.blogHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.blogHeroTitle || "Blog & Artikel"}</p>
                <p className="text-gray-300 text-xs mt-0.5">{formData.blogHeroSubtitle || "Tips, tutorial, dan insight seputar web development."}</p>
              </div>
            </div>
          )}

          {formData.blogHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.blogHeroPosition === value;
                  return (
                    <button key={value} type="button" title={value.replace("-", " ")}
                      onClick={() => setFormData((p) => ({ ...p, blogHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive ? "bg-primary-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Posisi: <span className="font-medium">{(formData.blogHeroPosition || "center").replace("-", " ")}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.blogHeroTitle}
                onChange={(e) => setFormData((p) => ({ ...p, blogHeroTitle: e.target.value }))}
                placeholder="Blog & Artikel"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.blogHeroSubtitle}
                onChange={(e) => setFormData((p) => ({ ...p, blogHeroSubtitle: e.target.value }))}
                placeholder="Tips, tutorial, dan insight..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* About Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">About Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the About page.</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.aboutHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, aboutHeroType: type, aboutHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {formData.aboutHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.aboutHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.aboutHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.aboutHeroType === "image" ? (
                    <img src={formData.aboutHeroUrl} alt="About Hero" className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[(formData.aboutHeroPosition || "center") as HeroPosition] }} />
                  ) : (
                    <video src={formData.aboutHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[(formData.aboutHeroPosition || "center") as HeroPosition] }} />
                  )}
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, aboutHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(formData.aboutHeroPosition || "center").replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => aboutHeroInputRef.current?.click()}>
                  {formData.aboutHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.aboutHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={aboutHeroInputRef} type="file"
                accept={formData.aboutHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "aboutHeroUrl")} className="hidden" />
              {!formData.aboutHeroUrl && (
                <button type="button" onClick={() => aboutHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.aboutHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {formData.aboutHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.aboutHeroTitle || "Tentang Kami"}</p>
                <p className="text-gray-300 text-xs mt-0.5">{formData.aboutHeroSubtitle || "Tim developer profesional untuk bisnis Anda."}</p>
              </div>
            </div>
          )}

          {formData.aboutHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.aboutHeroPosition === value;
                  return (
                    <button key={value} type="button" title={value.replace("-", " ")}
                      onClick={() => setFormData((prev) => ({ ...prev, aboutHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive ? "bg-primary-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Posisi: <span className="font-medium">{(formData.aboutHeroPosition || "center").replace("-", " ")}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.aboutHeroTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutHeroTitle: e.target.value }))}
                placeholder="Tentang Kami"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.aboutHeroSubtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutHeroSubtitle: e.target.value }))}
                placeholder="Tim developer profesional untuk bisnis Anda."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* Portfolio Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Portfolio Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the Portfolio page.</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.portfolioHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, portfolioHeroType: type, portfolioHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {formData.portfolioHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.portfolioHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.portfolioHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.portfolioHeroType === "image" ? (
                    <img src={formData.portfolioHeroUrl} alt="Portfolio Hero" className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[(formData.portfolioHeroPosition || "center") as HeroPosition] }} />
                  ) : (
                    <video src={formData.portfolioHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[(formData.portfolioHeroPosition || "center") as HeroPosition] }} />
                  )}
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, portfolioHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(formData.portfolioHeroPosition || "center").replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => portfolioHeroInputRef.current?.click()}>
                  {formData.portfolioHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.portfolioHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={portfolioHeroInputRef} type="file"
                accept={formData.portfolioHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "portfolioHeroUrl")} className="hidden" />
              {!formData.portfolioHeroUrl && (
                <button type="button" onClick={() => portfolioHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.portfolioHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {formData.portfolioHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-gray-900 to-primary-900 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.portfolioHeroTitle || "Portfolio"}</p>
                <p className="text-gray-300 text-xs mt-0.5">{formData.portfolioHeroSubtitle || "Koleksi proyek website profesional kami."}</p>
              </div>
            </div>
          )}

          {formData.portfolioHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.portfolioHeroPosition === value;
                  return (
                    <button key={value} type="button" title={value.replace("-", " ")}
                      onClick={() => setFormData((prev) => ({ ...prev, portfolioHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive ? "bg-primary-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Posisi: <span className="font-medium">{(formData.portfolioHeroPosition || "center").replace("-", " ")}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.portfolioHeroTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolioHeroTitle: e.target.value }))}
                placeholder="Portfolio"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.portfolioHeroSubtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolioHeroSubtitle: e.target.value }))}
                placeholder="Koleksi proyek website profesional kami."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* Services Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Services Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the Services page.</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.servicesHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, servicesHeroType: type, servicesHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {formData.servicesHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.servicesHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.servicesHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.servicesHeroType === "image" ? (
                    <img src={formData.servicesHeroUrl} alt="Services Hero" className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[(formData.servicesHeroPosition || "center") as HeroPosition] }} />
                  ) : (
                    <video src={formData.servicesHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[(formData.servicesHeroPosition || "center") as HeroPosition] }} />
                  )}
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, servicesHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(formData.servicesHeroPosition || "center").replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => servicesHeroInputRef.current?.click()}>
                  {formData.servicesHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.servicesHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={servicesHeroInputRef} type="file"
                accept={formData.servicesHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "servicesHeroUrl")} className="hidden" />
              {!formData.servicesHeroUrl && (
                <button type="button" onClick={() => servicesHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.servicesHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {formData.servicesHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-primary-900 to-primary-700 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.servicesHeroTitle || "Layanan Kami"}</p>
                <p className="text-gray-300 text-xs mt-0.5">{formData.servicesHeroSubtitle || "Solusi web development lengkap untuk bisnis Anda."}</p>
              </div>
            </div>
          )}

          {formData.servicesHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.servicesHeroPosition === value;
                  return (
                    <button key={value} type="button" title={value.replace("-", " ")}
                      onClick={() => setFormData((prev) => ({ ...prev, servicesHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive ? "bg-primary-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Posisi: <span className="font-medium">{(formData.servicesHeroPosition || "center").replace("-", " ")}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.servicesHeroTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, servicesHeroTitle: e.target.value }))}
                placeholder="Layanan Kami"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.servicesHeroSubtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, servicesHeroSubtitle: e.target.value }))}
                placeholder="Solusi web development lengkap untuk bisnis Anda."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* Pricing Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Pricing Page Hero</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the banner at the top of the Pricing page.</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["gradient", "image", "video"] as const).map((type) => {
              const icons = { gradient: Monitor, image: ImageIcon, video: Video };
              const labels = { gradient: "Gradient", image: "Image", video: "Video" };
              const Icon = icons[type];
              const active = formData.pricingHeroType === type;
              return (
                <button key={type} type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, pricingHeroType: type, pricingHeroUrl: "" }))}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {labels[type]}
                </button>
              );
            })}
          </div>

          {formData.pricingHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formData.pricingHeroType === "image" ? "Hero Image" : "Hero Video"}
              </label>
              {formData.pricingHeroUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 h-36">
                  {formData.pricingHeroType === "image" ? (
                    <img src={formData.pricingHeroUrl} alt="Pricing Hero" className="w-full h-full object-cover"
                      style={{ objectPosition: POSITION_CSS[(formData.pricingHeroPosition || "center") as HeroPosition] }} />
                  ) : (
                    <video src={formData.pricingHeroUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay
                      style={{ objectPosition: POSITION_CSS[(formData.pricingHeroPosition || "center") as HeroPosition] }} />
                  )}
                  <button type="button" onClick={() => setFormData((prev) => ({ ...prev, pricingHeroUrl: "" }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label="Remove media">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {(formData.pricingHeroPosition || "center").replace("-", " ")}
                  </div>
                </div>
              ) : (
                <div className="h-36 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => pricingHeroInputRef.current?.click()}>
                  {formData.pricingHeroType === "image" ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <Video className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">Click to upload {formData.pricingHeroType === "image" ? "image" : "video"}</span>
                </div>
              )}
              <input ref={pricingHeroInputRef} type="file"
                accept={formData.pricingHeroType === "image" ? "image/*" : "video/*"}
                onChange={(e) => handleUpload(e, "pricingHeroUrl")} className="hidden" />
              {!formData.pricingHeroUrl && (
                <button type="button" onClick={() => pricingHeroInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-3 h-3" /> Upload {formData.pricingHeroType === "image" ? "Image" : "Video"}
                </button>
              )}
            </div>
          )}

          {formData.pricingHeroType === "gradient" && (
            <div className="h-24 rounded-lg bg-gradient-to-br from-primary-900 to-primary-700 mb-5 flex items-center px-5">
              <div>
                <p className="text-white font-bold text-sm">{formData.pricingHeroTitle || "Harga Layanan"}</p>
                <p className="text-gray-300 text-xs mt-0.5">{formData.pricingHeroSubtitle || "Paket layanan yang transparan dan terjangkau."}</p>
              </div>
            </div>
          )}

          {formData.pricingHeroType !== "gradient" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Position <span className="text-gray-400 font-normal text-xs">(bagian mana yang ditampilkan)</span>
              </label>
              <div className="inline-grid grid-cols-3 gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                {POSITIONS.map(({ value, label }) => {
                  const isActive = formData.pricingHeroPosition === value;
                  return (
                    <button key={value} type="button" title={value.replace("-", " ")}
                      onClick={() => setFormData((prev) => ({ ...prev, pricingHeroPosition: value }))}
                      className={`w-10 h-10 rounded-lg text-lg font-bold transition-all flex items-center justify-center ${
                        isActive ? "bg-primary-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Posisi: <span className="font-medium">{(formData.pricingHeroPosition || "center").replace("-", " ")}</span></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Title <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.pricingHeroTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricingHeroTitle: e.target.value }))}
                placeholder="Harga Layanan"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input type="text" value={formData.pricingHeroSubtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricingHeroSubtitle: e.target.value }))}
                placeholder="Paket layanan yang transparan dan terjangkau."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>


        {/* CTA Section Background Slideshow */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">CTA Section Background</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload 3–10 gambar untuk slideshow otomatis di background CTA section halaman Home.
            Kosongkan untuk menggunakan radial gradient default.
          </p>

          {/* Image grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {(JSON.parse(formData.ctaSlideImages) as string[]).map((url: string, idx: number) => (
              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-900 group">
                <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => setFormData((p: any) => ({ ...p, ctaSlideImages: JSON.stringify((JSON.parse(p.ctaSlideImages) as string[]).filter((_: string, i: number) => i !== idx)) }))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  aria-label="Remove image">
                  <X className="w-5 h-5 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">{idx + 1}</span>
              </div>
            ))}
            {(JSON.parse(formData.ctaSlideImages) as string[]).length < 10 && (
              <button type="button"
                onClick={() => ctaSlideInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-primary-400 transition-colors text-gray-400 hover:text-primary-500">
                <Upload className="w-5 h-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>

          <input ref={ctaSlideInputRef} type="file" accept="image/*" className="hidden" multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              const remaining = 10 - formData.ctaSlideImages.length;
              const toUpload = files.slice(0, remaining);
              for (const file of toUpload) {
                const fd = new FormData();
                fd.append("file", file);
                try {
                  const r = await api.post("/media", fd, { headers: { "Content-Type": "multipart/form-data" } });
                  const url = r.data?.data?.url || r.data?.url;
                  if (url) setFormData((p: any) => ({ ...p, ctaSlideImages: JSON.stringify([...(JSON.parse(p.ctaSlideImages) as string[]), url]) }));
                } catch {}
              }
              if (ctaSlideInputRef.current) ctaSlideInputRef.current.value = "";
            }} />

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {(JSON.parse(formData.ctaSlideImages) as string[]).length < 10 && (
              <button type="button" onClick={() => ctaSlideInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Upload className="w-3 h-3" /> Upload Gambar
              </button>
            )}
            <span className="text-xs text-gray-400">{(JSON.parse(formData.ctaSlideImages) as string[]).length}/10 gambar</span>
            {(JSON.parse(formData.ctaSlideImages) as string[]).length > 0 && (JSON.parse(formData.ctaSlideImages) as string[]).length < 3 && (
              <span className="text-xs text-yellow-500">⚠ Minimal 3 gambar untuk slideshow</span>
            )}
          </div>

          {/* Interval setting */}
          <div className="mt-4 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interval Slide <span className="text-gray-400 font-normal text-xs">(detik)</span>
            </label>
            <input type="number" min="2" max="30"
              value={Math.round(parseInt(formData.ctaSlideInterval || "4000") / 1000)}
              onChange={(e) => setFormData((p: any) => ({ ...p, ctaSlideInterval: String(parseInt(e.target.value) * 1000) }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-500 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 transition-all">
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
