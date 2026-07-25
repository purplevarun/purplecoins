import { NativeModules, Platform } from "react-native";

type DetectedTransactionPayload = Readonly<{
	type: string;
	amount: string;
	source: string;
	detectedAt: number;
}>;

type UpiNotificationDetectorModule = Readonly<{
	consumeDetectedTransaction: () => Promise<DetectedTransactionPayload | null>;
	getDetectionEnabled: () => Promise<boolean>;
	isNotificationAccessEnabled: () => Promise<boolean>;
	openNotificationAccessSettings: () => void;
	setDetectionEnabled: (enabled: boolean) => void;
}>;

const getNativeModule = (): UpiNotificationDetectorModule | null => {
	if (Platform.OS !== "android") {
		return null;
	}
	const module = (NativeModules as { UpiNotificationDetector?: unknown })
		.UpiNotificationDetector;
	if (!module) {
		return null;
	}
	return module as unknown as UpiNotificationDetectorModule;
};

const getDetectionEnabled = async (): Promise<boolean> => {
	const module = getNativeModule();
	if (!module) {
		return false;
	}
	return module.getDetectionEnabled();
};

const setDetectionEnabled = (enabled: boolean): void => {
	const module = getNativeModule();
	if (!module) {
		return;
	}
	module.setDetectionEnabled(enabled);
};

const isNotificationAccessEnabled = async (): Promise<boolean> => {
	const module = getNativeModule();
	if (!module) {
		return false;
	}
	return module.isNotificationAccessEnabled();
};

const openNotificationAccessSettings = (): void => {
	const module = getNativeModule();
	if (!module) {
		return;
	}
	module.openNotificationAccessSettings();
};

const consumeDetectedTransaction =
	async (): Promise<DetectedTransactionPayload | null> => {
		const module = getNativeModule();
		if (!module) {
			return null;
		}
		return module.consumeDetectedTransaction();
	};

const upiDetectionService = {
	consumeDetectedTransaction,
	getDetectionEnabled,
	isNotificationAccessEnabled,
	openNotificationAccessSettings,
	setDetectionEnabled,
};

export type { DetectedTransactionPayload };
export default upiDetectionService;




