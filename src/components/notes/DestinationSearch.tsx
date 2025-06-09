import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { NoteFormData } from "./types";

export default function DestinationSearch() {
  const { control } = useFormContext<NoteFormData>();

  return (
    <FormField
      control={control}
      name="destination_id"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="destination">Miejsce docelowe</FormLabel>
          <FormControl>
            <select
              id="destination"
              data-testid="destination-select"
              {...field}
              value={field.value || ""}
              onChange={e => field.onChange(parseInt(e.target.value, 10))}
            >
              <option value="">Wybierz miejsce</option>
              <option value="1">Warszawa, Polska</option>
            </select>
          </FormControl>
          <div data-testid="destination-error">
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </div>
        </FormItem>
      )}
    />
  );
}
