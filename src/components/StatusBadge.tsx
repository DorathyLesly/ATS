import { ApplicationStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: "bg-status-applied/15 text-amber-700 border-status-applied/30",
  Screening: "bg-status-screening/15 text-blue-700 border-status-screening/30",
  Interview: "bg-status-interview/15 text-violet-700 border-status-interview/30",
  Offer: "bg-status-offer/15 text-emerald-700 border-status-offer/30",
  Rejected: "bg-status-rejected/15 text-rose-700 border-status-rejected/30",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
