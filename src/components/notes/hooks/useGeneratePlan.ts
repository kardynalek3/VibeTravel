import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generatePlan } from "@/lib/services/plans";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { toast } from "sonner";

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending: isGenerating } = useMutation({
    mutationFn: generatePlan,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan został wygenerowany");
      navigate(`/plans/${data.id}`);
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd podczas generowania planu"
      );
    },
  });

  return {
    generatePlan: mutate,
    isGenerating,
  };
}
