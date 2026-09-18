import React from "react";
import type { Resource } from "@/types/database";
import { ResourceCard } from "./resource-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LucideIcon } from "lucide-react";

interface ResourceGridProps {
  resources: Resource[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyActionText?: string;
  emptyActionHref?: string;
}

export function ResourceGrid({
  resources,
  emptyTitle = "No resources available yet",
  emptyDescription = "No verified digital resources match the selected criteria. Check back soon as new resources are published regularly.",
  emptyIcon,
  emptyActionText,
  emptyActionHref,
}: ResourceGridProps) {
  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        actionText={emptyActionText}
        actionHref={emptyActionHref}
        className="my-8"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
