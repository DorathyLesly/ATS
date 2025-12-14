export type ApplicationStatus = 
  | "Applied" 
  | "Screening" 
  | "Interview" 
  | "Offer" 
  | "Rejected";

export type JobStatus = "Open" | "Closed";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  requirements: string;
  status: JobStatus;
  createdAt: Date;
  applicationsCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  resumeUrl: string;
}

export interface Application {
  id: string;
  candidate: Candidate;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: Date;
  rating: number;
  notes: string;
  aiSummary: string;
  match_score: number;
  match_status: 'matched' | 'not_matched';
}
