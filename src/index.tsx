import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Main from "./main";
import { Providers } from "./lib/providers";

// import "./index.css";
// import "./tailwind.css";

const container = document.querySelector("#root") as Element;
const root = createRoot(container);

root.render(
  <StrictMode>
    <Providers>
      <Main />
    </Providers>
  </StrictMode>,
);
