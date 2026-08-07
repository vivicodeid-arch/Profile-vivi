import { useState, useEffect } from 'react';
import { Save, Globe } from 'lucide-react';
import api from '../services/api';

interface AboutContent {
  hero: { title: string; subtitle: string };
  story: { title: string; content: string };
  values: {
    title: string;
    quality: string; qualityDesc: string;
    innovation: string; innovationDesc: string;
    integrity: string; integrityDesc: string;
  };
  team: { title: string };
}

const defaultContent: AboutContent = {
  hero: { title: '', subtitle: '' },
  story: { title: '', content: '' },
  values: {
    title: '',
    quality: '', qualityDesc: '',
    innovation: '', innovationDesc: '',
    integrity: '', integrityDesc: '',
  },
  team: { title: '' },
};

type Lang = 'id' | 'en';

export default function AboutManager() {
  const [lang, setLang] = useState<Lang>('id');
  const [formData, setFormData] = useState<Record<Lang, AboutContent>>({ id: defaultContent, en: defaultContent });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const [idRes, enRes] = await Promise.all([
          fetch('/locales/id/pages.json'),
          fetch('/locales/en/pages.json'),
        ]);
        const idData = await idRes.json();
        const enData = await enRes.json();
        setFormData({
          id: idData.about ?? defaultContent,
          en: enData.about ?? defaultContent,
        });
      } catch (err) {
        console.error('Failed to fetch locales:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocales();
  }, []);

  const updateField = (section: keyof AboutContent, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...(prev[lang][section] as object),
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.all([
        api.put('/about-content', { lang: 'id', content: formData.id }),
        api.put('/about-content', { lang: 'en', content: formData.en }),
      ]);
      alert('About page content saved successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save content.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  const data = formData[lang];

  const inputClass = "w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";
  const sectionClass = "bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">About Page</h1>
          <p className="text-gray-400 mt-1">Manage content for the About page in both languages.</p>
        </div>
        {/* Language Toggle */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLang('id')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${lang === 'id' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            ID
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${lang === 'en' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            EN
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Hero Section</h2>
          <div>
            <label htmlFor="hero-title" className={labelClass}>Title</label>
            <input
              id="hero-title"
              type="text"
              value={data.hero.title}
              onChange={e => updateField('hero', 'title', e.target.value)}
              className={inputClass}
              placeholder="Tentang ViviDev.id"
            />
          </div>
          <div>
            <label htmlFor="hero-subtitle" className={labelClass}>Subtitle</label>
            <textarea
              id="hero-subtitle"
              rows={2}
              value={data.hero.subtitle}
              onChange={e => updateField('hero', 'subtitle', e.target.value)}
              className={textareaClass}
              placeholder="Kami adalah tim web developer..."
            />
          </div>
        </div>

        {/* Story Section */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Story Section</h2>
          <div>
            <label htmlFor="story-title" className={labelClass}>Title</label>
            <input
              id="story-title"
              type="text"
              value={data.story.title}
              onChange={e => updateField('story', 'title', e.target.value)}
              className={inputClass}
              placeholder="Cerita Kami"
            />
          </div>
          <div>
            <label htmlFor="story-content" className={labelClass}>Content</label>
            <textarea
              id="story-content"
              rows={5}
              value={data.story.content}
              onChange={e => updateField('story', 'content', e.target.value)}
              className={textareaClass}
              placeholder="ViviDev.id didirikan dengan misi..."
            />
          </div>
        </div>

        {/* Values Section */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Values Section</h2>
          <div>
            <label htmlFor="values-title" className={labelClass}>Section Title</label>
            <input
              id="values-title"
              type="text"
              value={data.values.title}
              onChange={e => updateField('values', 'title', e.target.value)}
              className={inputClass}
              placeholder="Nilai-Nilai Kami"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {(['quality', 'innovation', 'integrity'] as const).map(key => (
              <div key={key} className="space-y-3 bg-gray-950 rounded-lg p-4 border border-gray-800">
                <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">{key}</p>
                <div>
                  <label htmlFor={`${key}-label`} className="block text-xs text-gray-400 mb-1">Label</label>
                  <input
                    id={`${key}-label`}
                    type="text"
                    value={(data.values as any)[key]}
                    onChange={e => updateField('values', key, e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`${key}-desc`} className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea
                    id={`${key}-desc`}
                    rows={3}
                    value={(data.values as any)[`${key}Desc`]}
                    onChange={e => updateField('values', `${key}Desc`, e.target.value)}
                    className={textareaClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Team Section</h2>
          <div>
            <label htmlFor="team-title" className={labelClass}>Section Title</label>
            <input
              id="team-title"
              type="text"
              value={data.team.title}
              onChange={e => updateField('team', 'title', e.target.value)}
              className={inputClass}
              placeholder="Tim Kami"
            />
          </div>
          <p className="text-xs text-gray-500">Team members are managed separately under the <span className="text-primary-400">Team</span> menu.</p>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-500 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save All Languages
          </button>
        </div>
      </form>
    </div>
  );
}
