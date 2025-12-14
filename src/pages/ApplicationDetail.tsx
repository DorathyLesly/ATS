import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Download,
  Sparkles,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { RatingStars } from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { statusOrder } from "@/data/mockData";
import { ApplicationStatus } from "@/types";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    applications,
    updateApplicationStatus,
    updateApplicationNotes,
    updateApplicationRating,
  } = useAppStore();

  const application = applications.find((app) => app.id === id);

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Application not found.</p>
          <Link to="/applications" className="text-primary hover:underline mt-2 inline-block">
            Back to Applications
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { candidate } = application;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          to="/applications"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Applications
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {candidate.name}
                </h1>
                <p className="text-muted-foreground">{application.jobTitle}</p>
              </div>
              <StatusBadge status={application.status} className="text-sm" />
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {candidate.email}
              </a>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {candidate.phone}
              </span>
            </div>
          </Card>

          {/* Resume Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Resume</h2>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Resume preview would appear here</p>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6 border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Resume Insights
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Summary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {application.aiSummary}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Actions
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={application.status}
                  onValueChange={(value: ApplicationStatus) =>
                    updateApplicationStatus(application.id, value)
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        <StatusBadge status={status} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Rating</Label>
                <div className="mt-2">
                  <RatingStars
                    rating={application.rating}
                    onChange={(rating) =>
                      updateApplicationRating(application.id, rating)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recruiter Notes
            </h2>
            <Textarea
              placeholder="Add your notes about this candidate..."
              value={application.notes}
              onChange={(e) =>
                updateApplicationNotes(application.id, e.target.value)
              }
              className="min-h-[120px] resize-none"
            />
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">
                  Applied on {application.appliedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
