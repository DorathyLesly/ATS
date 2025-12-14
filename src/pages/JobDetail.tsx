import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Star, User, MapPin, Calendar, Mail, Phone, Upload, Filter } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8000/api";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, applications, updateApplicationStatus, updateApplicationNotes, updateApplicationRating } = useAppStore();

  const job = jobs.find(j => j.id === id);
  const jobApplications = applications.filter(app => app.jobId === id);

  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [uploadedCVs, setUploadedCVs] = useState<File[]>([]);
  const [filteredCVs, setFilteredCVs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getMatchScore = (candidateSkills: string[], jobRequirements: string) => {
    const requirements = jobRequirements.toLowerCase();
    const matchingSkills = candidateSkills.filter(skill =>
      requirements.includes(skill.toLowerCase())
    );
    return Math.round((matchingSkills.length / candidateSkills.length) * 100);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleStatusChange = async (applicationId: string, status: any) => {
    await updateApplicationStatus(applicationId, status);
  };

  const handleNotesChange = async (applicationId: string, notes: string) => {
    await updateApplicationNotes(applicationId, notes);
  };

  const handleRatingChange = async (applicationId: string, rating: number) => {
    await updateApplicationRating(applicationId, rating);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={job.title}
          description={`${job.department} • ${job.location}`}
          actions={
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          }
        />

        {/* Job Requirements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Requirements</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-muted-foreground">{job.requirements}</p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Posted {job.createdAt.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {job.applicationsCount} applications
            </div>
          </div>
        </Card>

        {/* CV Upload Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload CVs for Filtering</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select CV files (1-100 files at a time)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 100) {
                    alert('Maximum 100 files allowed');
                    return;
                  }
                  if (files.length < 1) {
                    alert('Please select at least 1 file');
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
                    setIsUploading(true);
                    // Simulate processing time
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setIsUploading(false);
                  }}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Processing...' : 'Upload CVs'}
                </Button>

                <Button
                  onClick={async () => {
                    if (uploadedCVs.length === 0) {
                      alert('Please upload CVs first');
                      return;
                    }

                    setIsFiltering(true);

                    try {
                      // For individual job filtering, use the job-specific logic
                      const results = [];

                      // Process each CV against this specific job
                      for (const cvFile of uploadedCVs) {
                        // Mock skill extraction (in real implementation, this would use NLP)
                        const mockSkillSets = [
                          ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker'],
                          ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS'],
                          ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems'],
                          ['JavaScript', 'Vue.js', 'CSS', 'HTML', 'Git', 'Webpack'],
                          ['SQL', 'Python', 'Tableau', 'Power BI', 'Data Analysis', 'Statistics'],
                          ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'],
                          ['Google Analytics', 'SEO', 'SEM', 'Content Marketing', 'HubSpot'],
                          ['Sketch', 'InVision', 'Principle', 'Wireframing', 'Usability Testing']
                        ];

                        const skills = mockSkillSets[Math.floor(Math.random() * mockSkillSets.length)];

                        // Calculate match score for this specific job
                        const requirements = job.requirements.toLowerCase();
                        const matchingSkills = skills.filter(skill =>
                          requirements.includes(skill.toLowerCase())
                        );
                        const matchScore = skills.length > 0 ? Math.round((matchingSkills.length / skills.length) * 100) : 0;

                        if (matchScore >= 60) { // Only show CVs with 60%+ match for individual jobs
                          results.push({
                            cvName: cvFile.name,
                            skills,
                            matchScore,
                            extractedText: `Extracted content from ${cvFile.name}... This CV contains skills in ${skills.slice(0, 3).join(', ')}...`,
                            uploadedAt: new Date()
                          });
                        }
                      }

                      // Sort by match score descending
                      results.sort((a, b) => b.matchScore - a.matchScore);

                      setFilteredCVs(results);
                    } catch (error) {
                      console.error('Error processing CVs:', error);
                      alert('Failed to process CVs. Please try again.');
                    } finally {
                      setIsFiltering(false);
                    }
                  }}
                  disabled={isFiltering || uploadedCVs.length === 0}
                  variant="default"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isFiltering ? 'Filtering...' : 'Filter CVs'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Filtered CVs */}
        {filteredCVs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Filtered CVs ({filteredCVs.length} matches found)
            </h3>
            <div className="grid gap-4">
              {filteredCVs.map((cv) => (
                <Card key={cv.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>CV</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{cv.fileName}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-medium">Match Score:</span>
                          <span className={cn("font-semibold", getMatchColor(cv.matchScore))}>
                            {cv.matchScore}%
                          </span>
                          <Progress value={cv.matchScore} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>

                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Selected
                    </Badge>
                  </div>

                  {/* Extracted Skills */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Extracted Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Text Preview */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-1">CV Preview</h5>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {cv.extractedText}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Uploaded {cv.uploadedAt.toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="default" size="sm">
                        Add to Candidates
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Applications */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Applications ({jobApplications.length})</h3>

          {jobApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No applications yet for this position.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobApplications.map((application) => {
                const matchScore = getMatchScore(application.candidate.skills, job.requirements);

                return (
                  <Card key={application.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {application.candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{application.candidate.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {application.candidate.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {application.candidate.phone}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium">Match Score:</span>
                            <span className={cn("font-semibold", getMatchColor(matchScore))}>
                              {matchScore}%
                            </span>
                            <Progress value={matchScore} className="w-20 h-2" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={
                          application.status === 'Offer' ? 'default' :
                          application.status === 'Interview' ? 'secondary' :
                          application.status === 'Screening' ? 'outline' : 'secondary'
                        }>
                          {application.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < application.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {application.candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* AI Summary */}
                    {application.aiSummary && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-medium mb-1">AI Summary</h5>
                        <p className="text-sm text-muted-foreground">{application.aiSummary}</p>
                      </div>
                    )}

                    {/* Application Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Screening">Screening</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Offer">Offer</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Rating</label>
                        <Select
                          value={application.rating.toString()}
                          onValueChange={(value) => handleRatingChange(application.id, parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Applied</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {application.appliedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="text-sm font-medium">Notes</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        rows={3}
                        value={application.notes}
                        onChange={(e) => handleNotesChange(application.id, e.target.value)}
                        placeholder="Add notes about this candidate..."
                      />
                    </div>

                    {/* Resume Link */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Applied {application.appliedAt.toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
