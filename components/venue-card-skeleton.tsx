import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VenueCardSkeletonProps {
  className?: string;
}

export function VenueCardSkeleton({ className }: VenueCardSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-lg border border-border bg-card",
      className
    )}>
      <Skeleton className="aspect-[4/3] w-full" />
      
      <div className="flex flex-col p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="pt-2">
          <Skeleton className="h-6 w-1/3 rounded-full" />
        </div>
      </div>
    </div>
  );
} 