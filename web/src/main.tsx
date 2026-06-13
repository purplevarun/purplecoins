import { App } from "@/App";
import { DatabaseProvider } from "@/hooks/useDatabase";
import { RouterProvider } from "@/hooks/useRouter";
import "@/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<DatabaseProvider>
			<RouterProvider>
				<App />
			</RouterProvider>
		</DatabaseProvider>
	</StrictMode>,
);
