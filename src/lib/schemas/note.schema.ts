import { z } from "zod";
import { SegmentType, TransportType } from "../../types.ts";

/**
 * Schemat walidacji dla tworzenia notatek
 * Waliduje dane wejściowe żądania POST /notes
 */
export const noteCreateSchema = z.object({
  destination_id: z.number().int().positive({
    message: "ID miejsca docelowego musi być liczbą całkowitą dodatnią",
  }),
  segment: z
    .nativeEnum(SegmentType, {
      errorMap: () => ({
        message: "Nieprawidłowy typ segmentu. Dozwolone wartości: family, couple, solo",
      }),
    })
    .optional(),
  transport: z
    .nativeEnum(TransportType, {
      errorMap: () => ({
        message:
          "Nieprawidłowy typ transportu. Dozwolone wartości: car, public_transport, plane, walking",
      }),
    })
    .optional(),
  duration: z
    .number()
    .int()
    .min(1, {
      message: "Czas trwania musi wynosić co najmniej 1 dzień",
    })
    .max(5, {
      message: "Czas trwania nie może przekraczać 5 dni",
    }),
  attractions: z.string().max(500, {
    message: "Opis atrakcji nie może przekraczać 500 znaków",
  }),
  is_draft: z.boolean().optional().default(true),
});
