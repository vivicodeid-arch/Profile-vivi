export interface BilingualText {
  id: string;
  en: string;
  [key: string]: string;
}

export interface Post {
  id: string;
  slug: string;
  title: BilingualText;
  content: BilingualText;
  excerpt: BilingualText;
  metaTitle: BilingualText;
  metaDesc: BilingualText;
  coverImage?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  title: BilingualText;
  description: BilingualText;
  category: string;
  imageUrl: string;
  projectUrl?: string;
  techStack: string[];
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Service {
  id: string;
  title: BilingualText;
  description: BilingualText;
  icon: string;
  imageUrl?: string | null;
  order: number;
  active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: BilingualText;
  bio: BilingualText;
  photo?: string;
  linkedIn?: string;
  order: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactSubmission extends ContactFormData {
  id: string;
  ipAddress?: string;
  read: boolean;
  createdAt: string;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AnalyticsSummary {
  pageViews: { today: number; last7Days: number; last30Days: number };
  topPages: { path: string; views: number }[];
  dailyTrend: { date: string; count: number }[];
  contacts: { total: number; unread: number };
}
