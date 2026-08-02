import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
	NativeModules: {},
	Platform: { OS: "android" },
}));

describe("upiDetectionService", () => {
	afterEach(() => {
		vi.resetModules();
		vi.doUnmock("react-native");
	});

	describe("when running on a non-android platform", () => {
		it("returns safe defaults without touching the native module", async () => {
			vi.doMock("react-native", () => ({
				NativeModules: {},
				Platform: { OS: "ios" },
			}));
			const { default: service } =
				await import("@/services/upiDetectionService");

			expect(await service.getDetectionEnabled()).toBe(false);
			expect(await service.isNotificationAccessEnabled()).toBe(false);
			expect(await service.consumeDetectedTransaction()).toBeNull();
			expect(() => service.setDetectionEnabled(true)).not.toThrow();
			expect(() =>
				service.openNotificationAccessSettings(),
			).not.toThrow();
		});
	});

	describe("when the native module is unavailable on android", () => {
		it("returns safe defaults", async () => {
			vi.doMock("react-native", () => ({
				NativeModules: {},
				Platform: { OS: "android" },
			}));
			const { default: service } =
				await import("@/services/upiDetectionService");

			expect(await service.getDetectionEnabled()).toBe(false);
			expect(await service.isNotificationAccessEnabled()).toBe(false);
			expect(await service.consumeDetectedTransaction()).toBeNull();
			expect(() => service.setDetectionEnabled(true)).not.toThrow();
			expect(() =>
				service.openNotificationAccessSettings(),
			).not.toThrow();
		});
	});

	describe("when the native module is available on android", () => {
		const buildNativeModule = (): {
			consumeDetectedTransaction: ReturnType<typeof vi.fn>;
			getDetectionEnabled: ReturnType<typeof vi.fn>;
			isNotificationAccessEnabled: ReturnType<typeof vi.fn>;
			openNotificationAccessSettings: ReturnType<typeof vi.fn>;
			setDetectionEnabled: ReturnType<typeof vi.fn>;
		} => ({
			consumeDetectedTransaction: vi.fn().mockResolvedValue({
				type: "DEBIT",
				amount: "100",
				source: "Bank",
				detectedAt: 1,
				merchant: "Swiggy",
				referenceId: "REF123456",
				channel: "NOTIFICATION",
			}),
			getDetectionEnabled: vi.fn().mockResolvedValue(true),
			isNotificationAccessEnabled: vi.fn().mockResolvedValue(true),
			openNotificationAccessSettings: vi.fn(),
			setDetectionEnabled: vi.fn(),
		});

		it("delegates every call to the native module", async () => {
			const nativeModule = buildNativeModule();
			vi.doMock("react-native", () => ({
				NativeModules: { UpiNotificationDetector: nativeModule },
				Platform: { OS: "android" },
			}));
			const { default: service } =
				await import("@/services/upiDetectionService");

			expect(await service.getDetectionEnabled()).toBe(true);
			expect(await service.isNotificationAccessEnabled()).toBe(true);
			expect(await service.consumeDetectedTransaction()).toEqual({
				type: "DEBIT",
				amount: "100",
				source: "Bank",
				detectedAt: 1,
				merchant: "Swiggy",
				referenceId: "REF123456",
				channel: "NOTIFICATION",
			});
			service.setDetectionEnabled(false);
			service.openNotificationAccessSettings();

			expect(nativeModule.setDetectionEnabled).toHaveBeenCalledWith(
				false,
			);
			expect(
				nativeModule.openNotificationAccessSettings,
			).toHaveBeenCalled();
		});
	});
});
