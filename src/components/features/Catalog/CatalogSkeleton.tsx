import { Skeleton } from '../../ui/skeleton';

interface CatalogSkeletonProps {
  count?: number;
}

export function CatalogCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Image skeleton */}
      <div className="relative aspect-square w-full p-2">
        <Skeleton className="h-full w-full rounded-md" />
        {/* Badge skeleton */}
        <Skeleton className="absolute right-2 top-2 h-5 w-20 rounded-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-2 p-3 pt-0">
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Description */}
        <Skeleton className="h-3 w-full" />
        
        {/* Category and unit */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

export function CatalogSkeleton({ count = 12 }: CatalogSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <CatalogCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CatalogHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
