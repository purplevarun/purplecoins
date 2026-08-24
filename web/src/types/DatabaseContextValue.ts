import type { WebDatabase } from "@/db/database";
type DatabaseContextValue = {
	db: WebDatabase | null;
	dataVersion: number;
	refreshData: () => void;
};
export type { DatabaseContextValue };
