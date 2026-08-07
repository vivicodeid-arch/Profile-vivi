import { useTranslation } from 'react-i18next';
import { CheckCircle, Heart, Zap } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import { useApi } from '../hooks/useApi';
import type { TeamMember } from '../types';
import { SITE_URL, SITE_NAME } from '../lib/constants';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Jasa web developer profesional di Indonesia',
  foundingDate: '2019',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-857-9811-2370',
    contactType: 'customer service',
  },
};

const values = [
  { icon: CheckCircle, labelKey: 'about.values.quality'    },
  { icon: Zap,         labelKey: 'about.values.speed'      },
  { icon: Heart,       labelKey: 'about.values.dedication' },
];

export default function About() {
  const { t, i18n } = useTranslation(['pages']);
  const lang = i18n.language as 'id' | 'en';

  const { data: members, isLoading } = useApi<TeamMember[]>('/team');

  return (
    <>
      <SEOHead
        title={t('about.meta.title')}
        description={t('about.meta.description')}
        canonical="/about"
        schema={schema}
      />

      <PageHero
        page="about"
        titleKey="about.hero.title"
        subtitleKey="about.hero.subtitle"
      />

      {/* Mission & values */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t('about.mission.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
            {t('about.mission.body')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, labelKey }) => (
              <div
                key={labelKey}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20"
              >
                <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400 shrink-0" aria-hidden="true" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {isLoading ? (
        <Spinner />
      ) : members && members.length > 0 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-950">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
              {t('about.team.title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map(member => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {member.name[0]}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                    {member.role[lang]}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                    {member.bio[lang]}
                  </p>

                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
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
