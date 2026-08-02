import {
	useCallback,
	useEffect,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";

import useDatabaseContext from "@/hooks/useDatabaseContext";
import navigationRef from "@/navigation/navigationRef";
import budgetAlertService from "@/services/budgetAlertService";
import merchantCategoryService from "@/services/merchantCategoryService";
import todoReminderService from "@/services/todoReminderService";
import upiDetectionService from "@/services/upiDetectionService";

import type { DetectedTransactionPayload } from "@/services/upiDetectionService";
import type TransactionType from "@/types/TransactionType";

const { syncBudgetAlerts } = budgetAlertService;
const { syncTodoReminders } = todoReminderService;
const { consumeDetectedTransaction } = upiDetectionService;
const { getSuggestionForMerchant } = merchantCategoryService;

const getTransactionType = (rawType: string): TransactionType =>
	rawType.toLowerCase() === "credit" ? "CREDIT" : "DEBIT";

const getReadableSource = (
	payload: Pick<DetectedTransactionPayload, "channel" | "source">,
): string => {
	const { channel, source } = payload;
	if (channel === "SMS") {
		return source ? `SMS (${source})` : "SMS";
	}
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
	if (source.includes("google.android.gm")) {
		return "Gmail";
	}
	const compact = source.substring(source.lastIndexOf(".") + 1);
	return compact || source;
};

const NotificationProvider = ({ children }: PropsWithChildren): ReactNode => {
	const { database, dataVersion } = useDatabaseContext();

	const syncNotifications = useCallback(async (): Promise<void> => {
		await Promise.all([
			syncTodoReminders(database),
			syncBudgetAlerts(database),
		]);
	}, [database]);

	const handleDetectedTransactionLaunch =
		useCallback(async (): Promise<void> => {
			if (Platform.OS !== "android" || !navigationRef.isReady()) {
				return;
			}
			const payload = await consumeDetectedTransaction();
			if (!payload?.amount) {
				return;
			}
			const suggestion = payload.merchant
				? await getSuggestionForMerchant(database, payload.merchant)
				: null;
			navigationRef.navigate("TransactionForm", {
				prefillAmount: payload.amount,
				prefillReason:
					payload.merchant ??
					`Detected from ${getReadableSource(payload)}`,
				prefillTransactionAt: payload.detectedAt,
				prefillType: getTransactionType(payload.type),
				prefillCategoryId: suggestion?.categoryId ?? undefined,
				prefillSourceId: suggestion?.sourceId ?? undefined,
				prefillMerchant: payload.merchant ?? undefined,
			});
		}, [database]);

	useEffect(() => {
		void syncNotifications();
	}, [dataVersion, syncNotifications]);

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
				void syncNotifications();
				void handleDetectedTransactionLaunch();
			}
		});
		return () => subscription.remove();
	}, [syncNotifications, handleDetectedTransactionLaunch]);

	return children;
};

export default NotificationProvider;
