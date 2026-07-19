export interface JobApplication {
  id: string;
  company: string;
  position: string;
  jobLink?: string;
  location: string;
  workType: 'Remote' | 'Onsite' | 'Hybrid';
  dateFound: string; // YYYY-MM-DD
  deadline?: string;  // YYYY-MM-DD
  dateApplied?: string; // YYYY-MM-DD
  status: 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  matchScore: number; // 0-100 rating
  followUpDate?: string; // YYYY-MM-DD
  nextAction?: string;
  notes?: string;
  
  // Extended AI metadata fields
  screenshot?: string; // Base64 dataURL or image URL path
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  aiMatchScore?: number;
  priority?: 'High' | 'Medium' | 'Low';
  skillGaps?: string[];
}

export type ApplicationStatus = JobApplication['status'];
export type WorkType = JobApplication['workType'];

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  resumeName?: string;
  resumeStatus?: string;
  skills: string[];
  education: {
    id: string;
    degree: string;
    school: string;
    year: string;
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    id: string;
    title: string;
    role: string;
    tech: string[];
    description: string;
  }[];
}
