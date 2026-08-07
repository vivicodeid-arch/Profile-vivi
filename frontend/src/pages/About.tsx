import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Heart, Zap } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';
import type { TeamMember } from '../types';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ViviDev.id',
  url: 'https://vividev.id',
  description: 'Jasa web developer profesional di Indonesia',
  foundingDate: '2020',
  contactPoint: { '@type': 'ContactPoint', telephone: '+62-857-9811-2370', contactType: 'customer service' },
};



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

function AboutHero() {
  const { settings } = useSettingsStore();
  const { t } = useTranslation(["pages"]);
  const heroType = settings.aboutHeroType || "gradient";
  const heroUrl  = settings.aboutHeroUrl  || "";
  const title    = settings.aboutHeroTitle    || t("about.hero.title");
  const subtitle = settings.aboutHeroSubtitle || t("about.hero.subtitle");
  const position = POSITION_CSS[settings.aboutHeroPosition || "center"] || "center center";

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
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container-custom">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
export default function About() {
  const { t, i18n } = useTranslation(['common', 'pages']);
  const lang = i18n.language as 'id' | 'en';
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    api.get('/team').then(r => setTeam(r.data.data || [])).catch(() => {});
  }, []);

  const values = [
    { icon: CheckCircle, key: 'quality', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
    { icon: Zap, key: 'innovation', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { icon: Heart, key: 'integrity', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' },
  ];

  return (
    <>
      <SEOHead
        title="Tentang Kami — ViviDev.id"
        description="ViviDev.id adalah tim web developer profesional yang berdedikasi membangun solusi digital terbaik untuk bisnis Anda."
        canonical="/about"
        schema={schema}
      />

      {/* Hero */}
      <AboutHero />

      {/* Story */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('about.story.title', { ns: 'pages' })}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t('about.story.content', { ns: 'pages' })}</p>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50 dark:bg-gray-950" aria-labelledby="values-heading">
        <div className="container-custom">
          <h2 id="values-heading" className="section-title">{t('about.values.title', { ns: 'pages' })}</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, key, color }) => (
              <div key={key} className="card p-8 text-center">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`about.values.${key}`, { ns: 'pages' })}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {t(`about.values.${key}Desc`, { ns: 'pages' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="section-padding bg-white dark:bg-gray-900" aria-labelledby="team-heading">
          <div className="container-custom">
            <h2 id="team-heading" className="section-title">{t('about.team.title', { ns: 'pages' })}</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map(member => (
                <div key={member.id} className="card p-6 text-center">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" loading="lazy" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{member.name[0]}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">{(member.role as Record<string, string>)[lang]}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{(member.bio as Record<string, string>)[lang]}</p>
                  {member.linkedIn && (
                    <a href={member.linkedIn} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      LinkedIn →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
