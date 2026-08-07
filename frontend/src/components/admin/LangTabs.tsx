type Lang = 'id' | 'en';

interface LangTabsProps {
  active: Lang;
  onChange: (lang: Lang) => void;
}

/**
 * Simple two-tab switcher for bilingual content (Indonesian / English).
 * Used in every admin editor that manages bilingual text fields.
 */
export default function LangTabs({ active, onChange }: LangTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-800 p-1 w-fit">
      {(['id', 'en'] as Lang[]).map(lang => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            active === lang
              ? 'bg-primary-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  );
}
