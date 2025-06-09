import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import type { DestinationBasicInfo } from "@/types";

interface NoteHeaderProps {
  destination: DestinationBasicInfo;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
}

export default function NoteHeader({
  destination,
  createdAt,
  updatedAt,
  isDraft,
}: NoteHeaderProps) {
  const formattedCreatedAt = format(new Date(createdAt), "d MMMM yyyy", { locale: pl });
  const formattedUpdatedAt = format(new Date(updatedAt), "d MMMM yyyy", { locale: pl });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {destination.city}, {destination.country}
        </h1>
        {isDraft && <Badge variant="secondary">Wersja robocza</Badge>}
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Utworzono: {formattedCreatedAt}</p>
        <p>Ostatnia modyfikacja: {formattedUpdatedAt}</p>
      </div>
    </div>
  );
}
