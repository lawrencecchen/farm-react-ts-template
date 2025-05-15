import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { postMessageToParent } from "~/lib/postMessageToParent";

interface ErrorDisplayProps {
  error: Error;
  reset?: () => void;
  path?: string;
  message?: string;
}

export function ErrorDisplay({ error, reset, path, message }: ErrorDisplayProps) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (path) {
      postMessageToParent({
        type: "componentError",
        error: {
          message: error.message,
          stack: error.stack,
        },
        path,
      });
    }
  }, [error, path]);

  function handleRetry() {
    queryClient.invalidateQueries();
    reset?.();
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-red-500">
      <div>{message}</div>
      <div className="text-sm">{error.message}</div>
      <button
        type="button"
        onClick={handleRetry}
        className="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
