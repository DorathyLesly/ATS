import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";

const statusOrder: ("Applied" | "Screening" | "Interview" | "Offer" | "Rejected")[] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];

export default function Dashboard() {
  const { jobs, applications, fetchJobs, fetchApplications } = useAppStore();

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications]);

  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const totalApplications = applications.length;
  const inProgress = applications.filter(
    (a) => a.status !== "Rejected" && a.status !== "Offer"
  ).length;
  const recentApplications = [...applications]
    .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
    .slice(0, 5);

  const statusCounts = statusOrder.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your hiring pipeline"
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 hover:shadow-soft transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{openJobs}</p>
              <p className="text-sm text-muted-foreground">Open Jobs</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-soft transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-status-screening/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-status-screening" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {totalApplications}
              </p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-soft transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-status-interview/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-status-interview" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-soft transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-status-offer/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-status-offer" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {applications.filter((a) => a.status === "Offer").length}
              </p>
              <p className="text-sm text-muted-foreground">Offers Extended</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Pipeline Overview
            </h2>
            <Link
              to="/applications"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {statusCounts.map(({ status, count }) => {
              const total = applications.length;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium text-foreground">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Applications
            </h2>
            <Link
              to="/applications"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {app.candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {app.candidate.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.jobTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
