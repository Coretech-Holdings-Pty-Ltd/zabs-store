
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { AuthProvider } from "./lib/auth-context.tsx";
  import { MEDUSA_BACKEND_URL } from "./lib/config.ts";

  // Log backend URL on frontend load
  console.log('🔌 Frontend connecting to backend:', MEDUSA_BACKEND_URL);

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  