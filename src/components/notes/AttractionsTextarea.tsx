import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { NoteFormData } from "./types";

const MAX_LENGTH = 5000;

export default function AttractionsTextarea() {
  const { control } = useFormContext<NoteFormData>();

  return (
    <FormField
      control={control}
      name="attractions"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="attractions">Atrakcje i miejsca do odwiedzenia</FormLabel>
          <FormControl>
            <div className="relative">
              <textarea
                id="attractions"
                data-testid="attractions-textarea"
                placeholder="Opisz atrakcje i miejsca, które chcesz odwiedzić..."
                {...field}
                className="min-h-[200px] resize-y"
                maxLength={MAX_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                {field.value?.length || 0}/{MAX_LENGTH}
              </div>
            </div>
          </FormControl>
          <div data-testid="attractions-error">
            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
          </div>
        </FormItem>
      )}
    />
  );
}
