import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import PageHero from '../components/ui/PageHero';
import api from '../services/api';
import type { ContactFormData } from '../types';
import { SITE_NAME, SITE_URL, WA_NUMBER, SUPPORT_EMAIL } from '../lib/constants';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  url: SITE_URL,
  telephone: '+62-857-9811-2370',
  email: SUPPORT_EMAIL,
  description: 'Jasa web developer profesional di Indonesia',
  address: { '@type': 'PostalAddress', addressCountry: 'ID' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-857-9811-2370',
    contactType: 'customer service',
    availableLanguage: ['Indonesian', 'English'],
  },
};

const EMPTY_FORM: ContactFormData = {
  name: '', email: '', phone: '', subject: '', message: '',
};

export default function Contact() {
  const { t } = useTranslation(['pages', 'common']);
  const [form, setForm]     = useState<ContactFormData>(EMPTY_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <SEOHead
        title={t('contact.meta.title')}
        description={t('contact.meta.description')}
        canonical="/contact"
        schema={schema}
      />

      <PageHero
        page="contact"
        titleKey="contact.hero.title"
        subtitleKey="contact.hero.subtitle"
      />

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('contact.info.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.info.body')}
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Mail className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-primary-600 transition-colors">
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                  <a
                    href={`https://wa.me/${WA_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                  >
                    +62 857-9811-2370
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo ViviDev.id, saya ingin konsultasi.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact form */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('contact.form.successTitle')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('contact.form.successBody')}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 btn-primary"
                  >
                    {t('contact.form.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('contact.form.title')}
                  </h2>

                  {status === 'error' && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {t('contact.form.error')}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.name')} *
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      value={form.name} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.email')} *
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.phone')}
                    </label>
                    <input
                      id="phone" name="phone" type="tel"
                      value={form.phone} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.subject')} *
                    </label>
                    <input
                      id="subject" name="subject" type="text" required
                      value={form.subject} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.message')} *
                    </label>
                    <textarea
                      id="message" name="message" rows={5} required
                      value={form.message} onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true" />
                        {t('cta.loading', { ns: 'common' })}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        {t('contact.form.submit')}
                      </>
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
