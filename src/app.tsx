import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuta
      retry: 2,
    },
  },
});

interface AppProps {
  children: ReactNode;
}

export default function App({ children }: AppProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
