import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Calendar, ToggleLeft, ToggleRight, Upload, Filter, Download, User } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8000/api";

export default function JobsPage() {
  const navigate = useNavigate();
  const { jobs, addJob, toggleJobStatus, fetchJobs, fetchApplications } = useAppStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [uploadedCVs, setUploadedCVs] = useState<File[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    location: "",
    requirements: "",
    status: "Open" as const,
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAddJob = async () => {
    if (newJob.title && newJob.department && newJob.location) {
      await addJob(newJob);
      setNewJob({ title: "", department: "", location: "", requirements: "", status: "Open" });
      setIsDialogOpen(false);
      fetchJobs(); // Refresh
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    await toggleJobStatus(jobId);
    fetchJobs(); // Refresh
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setUploadedCVs([]);
    setFilteredResults([]);
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setUploadedCVs([]);
    setFilteredResults([]);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={selectedJob ? `${selectedJob.title} - Resume Upload` : "Jobs"}
        description={
          selectedJob
            ? `Upload resumes to match against ${selectedJob.title} requirements`
            : "Manage your job openings"
        }
        actions={
          selectedJob ? (
            <Button variant="outline" onClick={handleBackToJobs}>
              Back to Jobs
            </Button>
          ) : (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          )
        }
      />

      {selectedJob ? (
        // Resume Upload Section for Selected Job
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Department:</span> {selectedJob.department}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedJob.location}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant={selectedJob.status === "Open" ? "default" : "secondary"} className="ml-2">
                  {selectedJob.status}
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-medium text-sm">Requirements:</span>
              <p className="text-sm text-muted-foreground mt-1">{selectedJob.requirements}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload CV files (PDF only, 1-100 files)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 100) {
                    toast({
                      title: "Too Many Files",
                      description: "Maximum 100 files allowed at once.",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (files.length < 1) {
                    toast({
                      title: "No Files Selected",
                      description: "Please select at least 1 file to upload.",
                      variant: "destructive",
                    });
                    return;
                  }
                  // Validate PDF files only
                  const invalidFiles = files.filter(file => file.type !== 'application/pdf');
                  if (invalidFiles.length > 0) {
                    toast({
                      title: "Invalid File Type",
                      description: "Only PDF files are allowed.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setUploadedCVs(files);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {uploadedCVs.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {uploadedCVs.length} CV{uploadedCVs.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={async () => {
                    if (uploadedCVs.length === 0) {
                      toast({
                        title: "No CVs Uploaded",
                        description: "Please upload CV files first before matching.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setIsFiltering(true);

                    try {
                      // Create FormData for file upload
                      const formData = new FormData();
                      uploadedCVs.forEach((file) => {
                        formData.append('cvs', file);
                      });

                      // Call the backend API for CV processing
                      const response = await fetch(`${API_BASE}/jobs/${selectedJob.id}/process_cvs/`, {
                        method: 'POST',
                        body: formData,
                      });

                      if (!response.ok) {
                        throw new Error('Failed to process CVs');
                      }

                      const data = await response.json();

                      // Transform the results to match frontend expectations
                      const results = data.filtered_cvs.map((cv: any) => ({
                        cvName: cv.fileName,
                        skills: cv.skills,
                        bestJob: selectedJob,
                        matchScore: cv.matchScore,
                        extractedText: cv.extractedText,
                        uploadedAt: new Date(),
                        status: cv.matchScore >= 80 ? 'Matched' : 'Not Matched',
                        id: cv.id
                      }));

                      setFilteredResults(results);
                    } catch (error) {
                      console.error('Error processing CVs:', error);
                      toast({
                        title: "Failed to Process CVs",
                        description: "An error occurred while processing the CV files. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsFiltering(false);
                    }
                  }}
                  disabled={isFiltering || uploadedCVs.length === 0}
                  variant="default"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isFiltering ? 'Processing CVs...' : 'Match CVs to Job'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        // Job List View
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="p-5 hover:shadow-soft transition-shadow animate-fade-in cursor-pointer"
              onClick={() => handleJobClick(job)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </div>
                <Badge
                  variant={job.status === "Open" ? "default" : "secondary"}
                  className={cn(
                    job.status === "Open"
                      ? "bg-status-offer/15 text-emerald-700 border-status-offer/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {job.createdAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {job.applicationsCount} applications
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(job.id);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {job.status === "Open" ? (
                    <>
                      <ToggleRight className="h-4 w-4 mr-1.5" />
                      Close
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-1.5" />
                      Reopen
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filtered Results */}
      {filteredResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            CV Matching Results ({filteredResults.length} processed CV{filteredResults.length !== 1 ? 's' : ''})
          </h3>
          <div className="grid gap-4">
            {filteredResults.map((result, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{result.cvName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Matched against: <span className="font-medium text-blue-600">{result.bestJob.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium">Match Score:</span>
                        <span className={cn("font-semibold",
                          result.matchScore >= 80 ? "text-green-600" :
                          result.matchScore >= 60 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {result.matchScore}%
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full",
                              result.matchScore >= 80 ? "bg-green-500" :
                              result.matchScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${result.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="default"
                    className={result.status === "Matched" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {result.status}
                  </Badge>
                </div>

                {/* Extracted Skills */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Extracted Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill: string, skillIndex: number) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Job Details */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Job Requirements</h5>
                  <p className="text-sm text-muted-foreground">{result.bestJob.requirements}</p>
                </div>

                {/* CV Preview */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <h5 className="text-sm font-medium mb-1">CV Preview</h5>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.extractedText}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Processed {result.uploadedAt.toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download CV
                    </Button>
                    {result.status === "Matched" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async () => {
                          try {
                            // Generate candidate name from CV filename
                            const candidateName = result.cvName.replace(/\.(pdf|doc|docx|txt)$/i, '').replace(/[-_]/g, ' ');

                            // Create a mock email (in real implementation, this would be extracted from CV)
                            const baseName = candidateName.replace(/\s+/g, '').toLowerCase();
                            let candidateEmail = `${baseName}@example.com`;
                            let emailCounter = 1;

                            // Keep trying different emails until we find one that doesn't exist
                            while (true) {
                              try {
                                const checkResponse = await fetch(`${API_BASE}/candidates/?email=${candidateEmail}`);
                                const existingCandidates = await checkResponse.json();
                                if (existingCandidates.length === 0) {
                                  break; // Email is available
                                }
                                emailCounter++;
                                candidateEmail = `${baseName}${emailCounter}@example.com`;
                              } catch (error) {
                                break; // If check fails, proceed with current email
                              }
                            }

                            const candidateData = {
                              name: candidateName,
                              email: candidateEmail,
                              phone: '+1 (555) 000-0000', // Mock phone
                              skills: result.skills,
                              resume_url: `/resumes/${result.cvName}` // Mock URL
                            };

                            // Create candidate via API
                            const candidateResponse = await fetch(`${API_BASE}/candidates/`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(candidateData)
                            });

                            if (candidateResponse.ok) {
                              const newCandidate = await candidateResponse.json();

                              // Check for duplicate application (same email + same job)
                              const existingAppsResponse = await fetch(`${API_BASE}/applications/?candidate__email=${candidateEmail}&job=${selectedJob.id}`);
                              const existingApps = await existingAppsResponse.json();

                              if (existingApps.length > 0) {
                                toast({
                                  title: "Duplicate Application",
                                  description: "This candidate has already applied for this job.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              // Create application with screening status
                              const applicationData = {
                                candidate: newCandidate.id,
                                job: selectedJob.id,
                                job_title: selectedJob.title,
                                status: 'Screening',
                                applied_at: new Date().toISOString(),
                                rating: 0, // Start with no rating
                                notes: `Auto-selected candidate with ${result.matchScore}% match score. Skills: ${result.skills.join(', ')}`,
                                ai_summary: `High-match candidate selected automatically. Strong alignment with job requirements.`,
                                match_score: result.matchScore,
                                match_status: 'matched'
                              };

                              const applicationResponse = await fetch(`${API_BASE}/applications/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(applicationData)
                              });

                              if (applicationResponse.ok) {
                                toast({
                                  title: "Candidate Selected Successfully! ✅",
                                  description: `${newCandidate.name} has been added to screening for ${selectedJob.title}.`,
                                });

                                // Refresh data
                                fetchJobs();
                                fetchApplications();

                                // Navigate to Applications page to view all candidates
                                navigate('/applications');
                              } else {
                                const errorData = await applicationResponse.json();
                                toast({
                                  title: "Failed to Create Application",
                                  description: `Error: ${JSON.stringify(errorData)}`,
                                  variant: "destructive",
                                });
                              }
                            } else {
                              const errorData = await candidateResponse.json();
                              toast({
                                title: "Failed to Create Candidate",
                                description: `Error: ${JSON.stringify(errorData)}`,
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('Error selecting candidate:', error);
                            toast({
                              title: "Failed to Select Candidate",
                              description: "An error occurred while selecting the candidate. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Select Candidate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${result.bestJob.id}`)}
                    >
                      View Job Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={newJob.title}
                onChange={(e) =>
                  setNewJob({ ...newJob, title: e.target.value })
                }
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newJob.department}
                onValueChange={(value) =>
                  setNewJob({ ...newJob, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newJob.location}
                onChange={(e) =>
                  setNewJob({ ...newJob, location: e.target.value })
                }
                placeholder="e.g. San Francisco, CA or Remote"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={newJob.requirements}
                onChange={(e) =>
                  setNewJob({ ...newJob, requirements: e.target.value })
                }
                placeholder="Describe the job requirements, skills needed, experience level, etc."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJob}>Add Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
