import { useCallback, useEffect, type PropsWithChildren, type ReactNode } from "react";
import { AppState, Platform } from "react-native";

import useDatabaseContext from "@/hooks/useDatabaseContext";
import navigationRef from "@/navigation/navigationRef";
import todoReminderService from "@/services/todoReminderService";
import upiDetectionService from "@/services/upiDetectionService";

import type TransactionType from "@/types/TransactionType";

const { syncTodoReminders } = todoReminderService;
const { consumeDetectedTransaction } = upiDetectionService;

const getTransactionType = (rawType: string): TransactionType =>
	rawType.toLowerCase() === "credit" ? "CREDIT" : "DEBIT";

const getReadableSource = (source: string): string => {
	if (!source) {
		return "a payment app";
	}
	if (source.includes("phonepe")) {
		return "PhonePe";
	}
	if (source.includes("paytm")) {
		return "Paytm";
	}
	if (source.includes("google.android.apps.nbu.paisa.user")) {
		return "Google Pay";
	}
	if (source.includes("bhim")) {
		return "BHIM";
	}
	if (source.includes("mobikwik")) {
		return "MobiKwik";
	}
	if (source.includes("amazon")) {
		return "Amazon Pay";
	}
	const compact = source.substring(source.lastIndexOf(".") + 1);
	return compact || source;
};

const NotificationProvider = ({ children }: PropsWithChildren): ReactNode => {
	const { database, dataVersion } = useDatabaseContext();

	const syncReminders = useCallback(async (): Promise<void> => {
		await syncTodoReminders(database);
	}, [database]);

	const handleDetectedTransactionLaunch = useCallback(async (): Promise<void> => {
		if (Platform.OS !== "android" || !navigationRef.isReady()) {
			return;
		}
		const payload = await consumeDetectedTransaction();
		if (!payload?.amount) {
			return;
		}
		navigationRef.navigate("TransactionForm", {
			prefillAmount: payload.amount,
			prefillReason: `Detected from ${getReadableSource(payload.source)}`,
			prefillTransactionAt: payload.detectedAt,
			prefillType: getTransactionType(payload.type),
		});
	}, []);

	useEffect(() => {
		void syncReminders();
	}, [dataVersion, syncReminders]);

	useEffect(() => {
		let attempts = 0;
		const interval = setInterval(() => {
			attempts += 1;
			void handleDetectedTransactionLaunch();
			if (attempts >= 8) {
				clearInterval(interval);
			}
		}, 400);
		return () => clearInterval(interval);
	}, [handleDetectedTransactionLaunch]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				void syncReminders();
				void handleDetectedTransactionLaunch();
			}
		});
		return () => subscription.remove();
	}, [syncReminders, handleDetectedTransactionLaunch]);

	return children;
};

export default NotificationProvider;

