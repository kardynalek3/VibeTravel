import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { NoteFormData } from "./types";

export default function DurationSelect() {
  const { control } = useFormContext<NoteFormData>();

  return (
    <FormField
      control={control}
      name="duration"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="duration">Długość wycieczki</FormLabel>
          <FormControl>
            <select
              id="duration"
              data-testid="duration-select"
              {...field}
              value={field.value || ""}
              onChange={e => field.onChange(parseInt(e.target.value, 10))}
            >
              <option value="">Wybierz długość</option>
              <option value="1">1 dzień</option>
              <option value="2">2 dni</option>
              <option value="3">3 dni</option>
              <option value="4">4 dni</option>
              <option value="5">5 dni</option>
            </select>
          </FormControl>
          <div data-testid="duration-error">
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </div>
        </FormItem>
      )}
    />
  );
}
