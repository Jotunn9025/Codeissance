import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WopeCom } from "./screens/WopeCom/WopeCom";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <WopeCom />
  </StrictMode>,
);
