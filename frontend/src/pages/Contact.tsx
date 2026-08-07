import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertCircle } from "lucide-react";
import { SEOHead } from "../components/seo/SEOHead";
import { useSettingsStore } from "../store/settingsStore";
import api from "../services/api";
import type { ContactFormData } from "../types";

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ViviDev.id",
  url: "https://vividev.id",
  telephone: "+62-857-9811-2370",
  email: "support@vividev.id",
  description: "Jasa web developer profesional di Indonesia",
  address: { "@type": "PostalAddress", addressCountry: "ID" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-857-9811-2370",
    contactType: "customer service",
    availableLanguage: ["Indonesian", "English"],
  },
};

type FormStatus = "idle" | "loading" | "success" | "error";

const POSITION_CSS: Record<string, string> = {
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

function ContactHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(["pages"]);
  const heroType = settings.contactHeroType || "gradient";
  const heroUrl  = settings.contactHeroUrl  || "";
  const title    = settings.contactHeroTitle    || t("contact.hero.title");
  const subtitle = settings.contactHeroSubtitle || t("contact.hero.subtitle");
  const position = POSITION_CSS[settings.contactHeroPosition || "center"] || "center center";

  if (heroType === "image" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${heroUrl})`, backgroundPosition: position }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  if (heroType === "video" && heroUrl) {
    return (
      <section className="relative pt-32 pb-16 text-white overflow-hidden min-h-[220px]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: position }}
          src={heroUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-primary-200 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}

export default function Contact() {
  const { t } = useTranslation(["common", "pages"]);
  const [form, setForm] = useState<ContactFormData>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validate = (): boolean => {
    const e: Partial<ContactFormData> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Nama minimal 2 karakter";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email tidak valid";
    if (!form.subject.trim() || form.subject.length < 5) e.subject = "Subjek minimal 5 karakter";
    if (!form.message.trim() || form.message.length < 10) e.message = "Pesan minimal 10 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      await api.post("/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const field = (key: keyof ContactFormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    },
  });

  const inputClass = (key: keyof ContactFormData) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 ${
      errors[key]
        ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20"
        : "border-gray-300 dark:border-gray-600 bg-white hover:border-gray-400 dark:hover:border-gray-500"
    }`;

  return (
    <>
      <SEOHead
        title={t("contact.hero.title", { ns: "pages" })}
        description={t("contact.hero.subtitle", { ns: "pages" })}
        schema={schema}
      />

      <ContactHero />

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t("contact.info.title", { ns: "pages" })}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("contact.info.response", { ns: "pages" })}
                </p>
              </div>
              <div className="space-y-4">
                <a href="mailto:support@vividev.id"
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                  aria-label="Email kami">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("contact.info.email", { ns: "pages" })}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">support@vividev.id</p>
                  </div>
                </a>
                <a href="tel:+6285798112370"
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                  aria-label="Telepon kami">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone / WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">+62 857-9811-2370</p>
                  </div>
                </a>
                <a href="https://wa.me/6285798112370" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                  aria-label="Chat WhatsApp">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("contact.info.whatsapp", { ns: "pages" })}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Chat langsung</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("contact.form.success", { ns: "pages" })}
                  </h3>
                  <button onClick={() => setStatus("idle")} className="btn-primary mt-6">
                    {t("cta.back", { ns: "common" }) || "Kirim Pesan Lagi"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.form.name", { ns: "pages" })} <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input id="name" type="text" {...field("name")} className={inputClass("name")}
                        placeholder={t("contact.form.name", { ns: "pages" })}
                        aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                      {errors.name && <p id="name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.form.email", { ns: "pages" })} <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input id="email" type="email" {...field("email")} className={inputClass("email")}
                        placeholder={t("contact.form.email", { ns: "pages" })}
                        aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                      {errors.email && <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.form.phone", { ns: "pages" })}
                      </label>
                      <input id="phone" type="tel" {...field("phone")} className={inputClass("phone")}
                        placeholder={t("contact.form.phone", { ns: "pages" })} />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("contact.form.subject", { ns: "pages" })} <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input id="subject" type="text" {...field("subject")} className={inputClass("subject")}
                        placeholder={t("contact.form.subject", { ns: "pages" })}
                        aria-required="true" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} />
                      {errors.subject && <p id="subject-error" className="text-xs text-red-500 mt-1" role="alert">{errors.subject}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("contact.form.message", { ns: "pages" })} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <textarea id="message" rows={5} {...field("message")} className={inputClass("message")}
                      placeholder={t("contact.form.message", { ns: "pages" })}
                      aria-required="true" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
                    {errors.message && <p id="message-error" className="text-xs text-red-500 mt-1" role="alert">{errors.message}</p>}
                  </div>
                  {status === "error" && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm" role="alert">
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {t("contact.form.error", { ns: "pages" })}
                    </div>
                  )}
                  <button type="submit" disabled={status === "loading"} className="w-full btn-primary py-4 text-base">
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {t("cta.loading", { ns: "common" })}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" aria-hidden="true" />
                        {t("contact.form.submit", { ns: "pages" })}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
