import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { RatingStars } from "@/components/RatingStars";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { statusOrder } from "@/data/mockData";
import { ApplicationStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationsPage() {
  const { applications, jobs, updateApplicationStatus } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        app.candidate.skills.some((skill) =>
          skill.toLowerCase().includes(search.toLowerCase())
        );

      const matchesJob = jobFilter === "all" || app.jobId === jobFilter;
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, search, jobFilter, statusFilter]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Applications"
        description={`${filteredApplications.length} candidates to review`}
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOrder.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Candidate</TableHead>
              <TableHead className="font-semibold">Job</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Applied</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow
                key={app.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {app.candidate.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.candidate.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">{app.jobTitle}</span>
                </TableCell>
                <TableCell>
                  <Select
                    value={app.status}
                    onValueChange={async (value: ApplicationStatus) => {
                      await updateApplicationStatus(app.id, value);
                      toast({
                        title: "Status Updated",
                        description: `${app.candidate.name}'s application status changed to ${value}`,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent hover:bg-muted/50 -ml-2">
                      <StatusBadge status={app.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOrder.map((status) => (
                        <SelectItem key={status} value={status}>
                          <StatusBadge status={status} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <RatingStars rating={app.rating} readonly size="sm" />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {app.appliedAt.toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/applications/${app.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredApplications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No applications match your filters.
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
