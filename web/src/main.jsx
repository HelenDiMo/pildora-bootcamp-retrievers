import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/im-fell-english/latin-400.css";
import "@fontsource/im-fell-english/latin-400-italic.css";
import "@fontsource/special-elite/latin-400.css";
import "@fontsource/la-belle-aurore/latin-400.css";
import "./styles/base.css";
import "./styles/tablon.css";
import "./styles/slides.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
