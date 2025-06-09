import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Users2, Clock } from "lucide-react";
import type { NoteResponseDTO } from "@/types";

interface NoteContentProps {
  note: NoteResponseDTO;
}

export default function NoteContent({ note }: NoteContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły wycieczki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            <span>Segment: </span>
            <Badge variant="outline">{note.segment}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span>Transport: </span>
            <Badge variant="outline">{note.transport}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Długość wycieczki: </span>
            <Badge variant="outline">{note.duration} dni</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atrakcje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{note.attractions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
