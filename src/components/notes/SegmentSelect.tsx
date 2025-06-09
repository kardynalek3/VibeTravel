import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { NoteFormData } from "./types";
import { SegmentType } from "@/types";

export default function SegmentSelect() {
  const { control } = useFormContext<NoteFormData>();

  return (
    <FormField
      control={control}
      name="segment"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="segment">Segment podróży</FormLabel>
          <FormControl>
            <select id="segment" data-testid="segment-select" {...field} value={field.value || ""}>
              <option value="">Wybierz segment</option>
              <option value={SegmentType.Family}>Rodzina</option>
            </select>
          </FormControl>
          <div data-testid="segment-error">
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </div>
        </FormItem>
      )}
    />
  );
}
