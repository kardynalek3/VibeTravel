import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface GenerationLimitInfoProps {
  remainingGenerations: number;
  resetTime?: string;
}

export default function GenerationLimitInfo({
  remainingGenerations,
  resetTime,
}: GenerationLimitInfoProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Info className="h-4 w-4 cursor-help text-muted-foreground" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Limit generowania planów</h4>
          <p className="text-sm">
            Pozostało {remainingGenerations} generowań {resetTime && `(reset o ${resetTime})`}
          </p>
          <p className="text-xs text-muted-foreground">
            Limit jest odnawiany codziennie o północy.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
