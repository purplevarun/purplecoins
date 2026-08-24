import { createAdapter, initDatabase, type WebDatabase } from "@/db/database";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type DatabaseContextValue = {
	db: WebDatabase | null;
	dataVersion: number;
	refreshData: () => void;
	isLoading: boolean;
	setDb: (db: WebDatabase) => void;
};

const DatabaseContext = createContext<DatabaseContextValue>({
	db: null,
	dataVersion: 0,
	refreshData: () => {},
	isLoading: true,
	setDb: () => {},
});

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
	const [db, setDbState] = useState<WebDatabase | null>(null);
	const [dataVersion, setDataVersion] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		initDatabase().then((rawDb) => {
			setDbState(createAdapter(rawDb));
			setIsLoading(false);
		});
	}, []);

	const refreshData = useCallback(() => {
		setDataVersion((v) => v + 1);
	}, []);

	const setDb = useCallback((newDb: WebDatabase) => {
		setDbState(newDb);
		setDataVersion((v) => v + 1);
	}, []);

	return (
		<DatabaseContext.Provider
			value={{ db, dataVersion, refreshData, isLoading, setDb }}
		>
			{children}
		</DatabaseContext.Provider>
	);
};

export const useDb = (): DatabaseContextValue => useContext(DatabaseContext);
