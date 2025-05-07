import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Update document title
document.title = "ShopEase - Mini E-Commerce Platform";

createRoot(document.getElementById("root")!).render(<App />);
