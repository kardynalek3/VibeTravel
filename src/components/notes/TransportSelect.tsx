import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { NoteFormData } from "./types";
import { TransportType } from "@/types";

export default function TransportSelect() {
  const { control } = useFormContext<NoteFormData>();

  return (
    <FormField
      control={control}
      name="transport"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="transport">Środek transportu</FormLabel>
          <FormControl>
            <select
              id="transport"
              data-testid="transport-select"
              {...field}
              value={field.value || ""}
            >
              <option value="">Wybierz transport</option>
              <option value={TransportType.Car}>Samochód</option>
            </select>
          </FormControl>
          <div data-testid="transport-error">
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </div>
        </FormItem>
      )}
    />
  );
}
