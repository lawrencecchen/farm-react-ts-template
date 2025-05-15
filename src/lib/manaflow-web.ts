import { useQuery as useQueryTanstack } from "@tanstack/react-query";

const hasWindow = typeof window !== "undefined";
const isDev = hasWindow && window.location.hostname === "localhost";
const searchParams = new URLSearchParams(window.location.search);
const MANAFLOW_API_KEY = searchParams.get("key");
const MANAFLOW_BASE_URL = isDev
  ? "http://localhost:3009"
  : "https://api.manaflow.com";

export async function fetchQuery<T>(
  key: string,
  inputs?: Record<string, unknown>,
) {
  const response = await fetch(`${MANAFLOW_BASE_URL}/dashboard/query/${key}`, {
    method: "POST",
    body: JSON.stringify(inputs),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MANAFLOW_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch query");
  }
  const json = await response.json();
  return json as T;
}

function _getPanelPublicationId() {
  if (window.location.pathname.startsWith("/publication/pub-")) {
    return window.location.pathname.split("/")[2];
  }
  return window.location.hostname.split(".")[0];
}
function getPanelPublicationId() {
  const panelPublicationId = _getPanelPublicationId();
  if (!panelPublicationId) {
    throw new Error("Panel publication ID not found");
  }
  return panelPublicationId;
}

export async function fetchCachedQuery<T>(
  queryKey: string,
  panelPublicationId: string,
) {
  const response = await fetch(
    `${MANAFLOW_BASE_URL}/dashboard/query-cached/${panelPublicationId}/${queryKey}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MANAFLOW_API_KEY}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch cached query");
  }
  const json = await response.json();
  return json as T;
}

function shouldUseCachedQuery() {
  return (
    window.location.hostname.endsWith(".snapshot.bi.new") ||
    window.location.pathname.startsWith("/publication/pub-")
  );
}

export function useQuery<T>(key: string, inputs?: Record<string, unknown>) {
  return useQueryTanstack<T>({
    queryKey: ["manaflow-query", key, inputs],
    queryFn: async (): Promise<T> => {
      if (shouldUseCachedQuery()) {
        return fetchCachedQuery<T>(key, getPanelPublicationId());
      }
      return fetchQuery<T>(key, inputs);
    },
  });
}
