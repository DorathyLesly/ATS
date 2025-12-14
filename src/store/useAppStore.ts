import { create } from "zustand";
import { Job, Application, ApplicationStatus } from "@/types";

const API_BASE = "http://localhost:8000/api";

interface AppState {
  jobs: Job[];
  applications: Application[];
  loading: boolean;
  error: string | null;
  setJobs: (jobs: Job[]) => void;
  setApplications: (applications: Application[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addJob: (jobData: Omit<Job, "id" | "createdAt" | "applicationsCount">) => Promise<void>;
  toggleJobStatus: (jobId: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  updateApplicationNotes: (applicationId: string, notes: string) => Promise<void>;
  updateApplicationRating: (applicationId: string, rating: number) => Promise<void>;
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  jobs: [],
  applications: [],
  loading: false,
  error: null,

  setJobs: (jobs) => set({ jobs }),
  setApplications: (applications) => set({ applications }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchJobs: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_BASE}/jobs/`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const jobsData = await response.json();
      const jobs = jobsData.map((job: any) => ({
        ...job,
        createdAt: new Date(job.created_at),
      }));
      set({ jobs, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  fetchApplications: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_BASE}/applications/`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const applicationsData = await response.json();
      const applications = applicationsData.map((app: any) => ({
        ...app,
        appliedAt: new Date(app.applied_at),
      }));
      set({ applications, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  addJob: async (jobData) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to add job');
      const newJobData = await response.json();
      const newJob = {
        ...newJobData,
        createdAt: new Date(newJobData.created_at),
      };
      set((state) => ({ jobs: [...state.jobs, newJob] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  toggleJobStatus: async (jobId) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${jobId}/toggle_status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to toggle job status');
      const updatedJobData = await response.json();
      const updatedJob = {
        ...updatedJobData,
        createdAt: new Date(updatedJobData.created_at),
      };
      set((state) => ({
        jobs: state.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await fetch(`${API_BASE}/applications/${applicationId}/update_status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update application status');
      const updatedAppData = await response.json();
      const updatedApp = {
        ...updatedAppData,
        appliedAt: new Date(updatedAppData.applied_at),
      };
      set((state) => ({
        applications: state.applications.map((app) => (app.id === applicationId ? updatedApp : app)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateApplicationNotes: async (applicationId, notes) => {
    try {
      const response = await fetch(`${API_BASE}/applications/${applicationId}/update_notes/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to update notes');
      const updatedAppData = await response.json();
      const updatedApp = {
        ...updatedAppData,
        appliedAt: new Date(updatedAppData.applied_at),
      };
      set((state) => ({
        applications: state.applications.map((app) => (app.id === applicationId ? updatedApp : app)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateApplicationRating: async (applicationId, rating) => {
    try {
      const response = await fetch(`${API_BASE}/applications/${applicationId}/update_rating/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (!response.ok) throw new Error('Failed to update rating');
      const updatedAppData = await response.json();
      const updatedApp = {
        ...updatedAppData,
        appliedAt: new Date(updatedAppData.applied_at),
      };
      set((state) => ({
        applications: state.applications.map((app) => (app.id === applicationId ? updatedApp : app)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
}));
