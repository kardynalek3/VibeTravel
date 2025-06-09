import { useQuery } from "@tanstack/react-query";
import { fetchGenerationLimit } from "@/lib/services/users";

export function useGenerationLimit() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["generationLimit"],
    queryFn: fetchGenerationLimit,
    refetchInterval: 60000, // Odświeżaj co minutę
  });

  return {
    remainingGenerations: data?.remainingGenerations ?? 0,
    resetTime: data?.resetTime,
    isLoading,
    error,
  };
}
