import { Badge } from "@/components/ui/badge";
import { Domain } from "@shared/schema";
import { sanitizeText } from "../logic/guards";

interface DomainBadgeProps {
  domain: Domain;
  className?: string;
}

const domainColors: Record<Domain, string> = {
  joint: "bg-gray-500 text-white",
  economy: "bg-green-600 text-white", 
  cognitive: "bg-purple-600 text-white",
  space: "bg-blue-500 text-white",
  cyber: "bg-yellow-500 text-black"
};

const domainLabels: Record<Domain, string> = {
  joint: "Joint",
  economy: "Economy", 
  cognitive: "Cognitive",
  space: "Space",
  cyber: "Cyber"
};

export default function DomainBadge({ domain, className = "" }: DomainBadgeProps) {
  return (
    <Badge 
      className={`${domainColors[domain]} ${className}`}
      data-testid={`badge-domain-${domain}`}
    >
      {sanitizeText(domainLabels[domain])}
    </Badge>
  );
}