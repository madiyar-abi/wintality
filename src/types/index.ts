export type OpportunityCategory = 
  | 'olympiad'
  | 'mun'
  | 'internship'
  | 'scholarship'
  | 'summer_school'
  | 'hackathon'
  | 'university';

export type OpportunityScope = 'kazakhstan' | 'international';

export interface Opportunity {
  id: string;
  title: string;
  titleKz?: string;
  titleEn?: string;
  category: OpportunityCategory;
  categoryLabel: string;
  scope: OpportunityScope;
  cityBadge: string; // 'Астана' | 'Алматы' | 'Онлайн (РК)' | 'СНГ' | 'Global'
  organizer: string;
  description: string;
  descriptionKz?: string;
  descriptionEn?: string;
  fullDescription?: string;
  deadlineDate: string;
  daysLeft: number;
  location: string;
  country: string;
  flag: string;
  link: string;
  gradeMin: number;
  gradeMax: number;
  englishRequired: string;
  tags: string[];
  requirements: string[];
  matchScore?: number;
  matchReasons?: string[];
  isFeatured?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  grade: string;
  city?: string;
  interests: string[];
  targetCountry: string;
  englishLevel: string;
  bio?: string;
}

export interface SavedOpportunityItem {
  id: string;
  opportunityId: string;
  opportunity: Opportunity;
  status: 'saved' | 'applying' | 'applied';
  savedAt: string;
  notes?: string;
}
