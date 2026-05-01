import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { rescheduleAthan } from "./lib/athan-scheduler";

// Premium dark is the default theme
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);

// Schedule today's Athan + native notifications (no-op if no location yet)
if (typeof window !== "undefined") {
  // Defer to idle so it never blocks first paint
  setTimeout(() => rescheduleAthan(), 1500);
}
