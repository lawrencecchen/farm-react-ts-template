// Environment configuration
const env = {
  MANAFLOW_API_URL:
    process.env.VITE_MANAFLOW_BASE_URL || "https://api.manaflow.com",
  MANAFLOW_API_KEY: process.env.VITE_MANAFLOW_API_KEY || "default-api-key",
};

console.log("[CustomFileLoader] Environment:", {
  MANAFLOW_API_URL: env.MANAFLOW_API_URL,
  MANAFLOW_API_KEY: env.MANAFLOW_API_KEY ? env.MANAFLOW_API_KEY : "not set",
});

process.stdin.on('data', (data) => {
  try {
    const message = JSON.parse(data.toString().trim());
    console.log("[CustomFileLoader] Received message from stdin:", message);
    
    if (message.apiKey) {
      env.MANAFLOW_API_KEY = message.apiKey;
      console.log("[CustomFileLoader] Updated API key");
    }
    
    if (message.apiUrl) {
      env.MANAFLOW_API_URL = message.apiUrl;
      console.log("[CustomFileLoader] Updated API URL to:", message.apiUrl);
    }
  } catch (error) {
    console.error("[CustomFileLoader] Error parsing stdin message:", error);
  }
});

const USE_LOCAL = false;

export async function fetchCustomComponent(
  key: string
): Promise<{ loader: string; contents: string }> {
  console.log("[CustomFileLoader] Fetching component:", key);

  const match = key.match(/^(.+)@(.+)$/);
  if (!match) {
    throw new Error(`Invalid remote component path: ${key}`);
  }

  const [_, componentKey, version] = match;

  if (USE_LOCAL) {
    return {
      loader: "tsx",
      contents: `\
import React from "react";
import { Button } from "@tremor/react";
export default function LocalComponent() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <Button onClick={() => setCount(count + 1)}>Click me! I'm a local component!</Button>
      <p>Count: {count}</p>
    </div>
  );
}`,
    };
  }

  try {
    // Fetch the component source from the API
    const url = `${env.MANAFLOW_API_URL}/dashboard/component-src/${componentKey}/${version}`;
    console.log(`[CustomFileLoader] Fetching from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.MANAFLOW_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("[CustomFileLoader] Failed to fetch component");
      console.error(await response.text());
      throw new Error(`Failed to fetch component: ${response.statusText}`);
    }

    const data = await response.json();
    const jsx = data.jsx;

    if (!jsx) {
      throw new Error("Invalid component data: missing jsx property");
    }

    return {
      loader: "tsx",
      contents: `\
import React from "react";
${jsx}`,
    };
  } catch (error) {
    console.error("[CustomFileLoader] Error loading remote component:", error);
    const errorString = error instanceof Error ? error.message : String(error);
    const errorStringEscaped = errorString.replace(/"/g, '\\"');
    const errorJson = JSON.stringify({
      message: errorStringEscaped,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return a fallback component on error
    return {
      loader: "tsx",
      contents: `\
import React from "react";
export default function ErrorComponent() {
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #f44336',
      borderRadius: '8px',
      margin: '10px',
      backgroundColor: '#ffebee'
    }}>
      <h2>Error Loading Component</h2>
      <p>Failed to load component: ${errorStringEscaped}</p>
      <pre style={{ overflow: 'auto', maxHeight: '200px' }}>{${errorJson}.stack}</pre>
    </div>
  );
}`,
    };
  }
}
