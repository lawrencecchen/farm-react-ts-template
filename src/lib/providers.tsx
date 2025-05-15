"use client";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<NuqsAdapter>
			<QueryClientProvider client={queryClient}>
				<Theme accentColor="gray" grayColor="gray">
					{children}
				</Theme>
			</QueryClientProvider>
		</NuqsAdapter>
	);
}
