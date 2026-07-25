import { useCallback, useEffect, type PropsWithChildren, type ReactNode } from "react";
import { AppState } from "react-native";

import useDatabaseContext from "@/hooks/useDatabaseContext";
import todoReminderService from "@/services/todoReminderService";

const { syncTodoReminders } = todoReminderService;

const NotificationProvider = ({ children }: PropsWithChildren): ReactNode => {
	const { database, dataVersion } = useDatabaseContext();

	const syncReminders = useCallback(async (): Promise<void> => {
		await syncTodoReminders(database);
	}, [database]);

	useEffect(() => {
		void syncReminders();
	}, [dataVersion, syncReminders]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				void syncReminders();
			}
		});
		return () => subscription.remove();
	}, [syncReminders]);

	return children;
};

export default NotificationProvider;

