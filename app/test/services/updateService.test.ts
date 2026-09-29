import type TestAsyncFunction from "@test/types/TestAsyncFunction";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	downloadFileAsync: vi.fn<TestAsyncFunction>(),
	getContentUriAsync: vi.fn<TestAsyncFunction>(),
	readAsStringAsync: vi.fn<TestAsyncFunction>(),
	getInfoAsync: vi.fn<TestAsyncFunction>(),
	getUriForDirectoryInRoot: vi.fn(),
	requestDirectoryPermissionsAsync: vi.fn<TestAsyncFunction>(),
	createFileAsync: vi.fn<TestAsyncFunction>(),
	safWriteAsStringAsync: vi.fn<TestAsyncFunction>(),
	safDeleteAsync: vi.fn<TestAsyncFunction>(),
	startActivityAsync: vi.fn<TestAsyncFunction>(),
	files: new Map<string, number>(),
}));

vi.mock("expo-file-system", () => ({
	File: class MockFile {
		uri: string;

		constructor(directory: string, name: string) {
			this.uri = `${directory}/${name}`;
		}

		get exists(): boolean {
			return mocks.files.has(this.uri);
		}

		get size(): number {
			return mocks.files.get(this.uri) ?? 0;
		}

		static downloadFileAsync = mocks.downloadFileAsync;
	},
	Paths: { cache: "cache-dir" },
}));

vi.mock("expo-file-system/legacy", () => ({
	getContentUriAsync: mocks.getContentUriAsync,
	readAsStringAsync: mocks.readAsStringAsync,
	getInfoAsync: mocks.getInfoAsync,
	EncodingType: { UTF8: "utf8", Base64: "base64" },
	StorageAccessFramework: {
		requestDirectoryPermissionsAsync:
			mocks.requestDirectoryPermissionsAsync,
		getUriForDirectoryInRoot: mocks.getUriForDirectoryInRoot,
		createFileAsync: mocks.createFileAsync,
		writeAsStringAsync: mocks.safWriteAsStringAsync,
		deleteAsync: mocks.safDeleteAsync,
	},
}));

vi.mock("expo-intent-launcher", () => ({
	startActivityAsync: mocks.startActivityAsync,
}));

import updateConstants from "@/constants/updateConstants";
import updateService from "@/services/updateService";
import appConfig from "../../app.json";

const { GITHUB_RELEASE_API_URL } = updateConstants;
const apk = (name = "com.purple.coins_2026.9.22.apk") => ({
	name,
	state: "uploaded",
	size: 123,
	browser_download_url: `https://github.com/purplevarun/purplecoins/releases/download/v2026.9.22/${name}`,
});
const release = (overrides: Record<string, unknown> = {}) => ({
	name: "v2026.9.22",
	tag_name: "v2026.9.22",
	draft: false,
	prerelease: false,
	assets: [apk()],
	...overrides,
});

const pendingRelease = {
	version: "2026.9.22",
	name: "com.purple.coins_2026.9.22.apk",
	downloadUrl: apk().browser_download_url,
	size: 123,
};
const cachedApkUri = `cache-dir/${pendingRelease.name}`;

const setFetchResponse = (value: unknown, status = 200): void => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({
			ok: status >= 200 && status < 300,
			status,
			json: async () => value,
		})),
	);
};

describe("updateService", () => {
	beforeEach(() => {
		mocks.downloadFileAsync.mockReset();
		mocks.getContentUriAsync.mockReset();
		mocks.readAsStringAsync.mockReset();
		mocks.getInfoAsync.mockReset();
		mocks.getUriForDirectoryInRoot.mockReset();
		mocks.requestDirectoryPermissionsAsync.mockReset();
		mocks.createFileAsync.mockReset();
		mocks.safWriteAsStringAsync.mockReset();
		mocks.safDeleteAsync.mockReset();
		mocks.startActivityAsync.mockReset();
		mocks.files.clear();
		mocks.getUriForDirectoryInRoot.mockReturnValue(
			"content://root/Download",
		);
		mocks.requestDirectoryPermissionsAsync.mockResolvedValue({
			granted: false,
		});
		mocks.safDeleteAsync.mockResolvedValue(undefined);
		vi.unstubAllGlobals();
	});

	it("uses the release name to recognize the current version", async () => {
		setFetchResponse(
			release({ name: " v2026.9.21 ", tag_name: "v2026.9.22" }),
		);
		expect(await updateService.checkForUpdate("2026.9.21")).toBeNull();
		expect(fetch).toHaveBeenCalledWith(GITHUB_RELEASE_API_URL, {
			headers: { Accept: "application/vnd.github+json" },
		});
	});

	it("returns an available release and prefers a universal APK", async () => {
		setFetchResponse(
			release({
				assets: [
					apk("com.purple.coins_2026.9.22-arm64.apk"),
					apk("com.purple.coins_2026.9.22-universal.apk"),
				],
			}),
		);
		await expect(
			updateService.checkForUpdate("2026.9.21"),
		).resolves.toMatchObject({
			version: "2026.9.22",
			name: "com.purple.coins_2026.9.22-universal.apk",
		});
	});

	it.each([
		[release({ draft: true }), "latest release"],
		[release({ name: null }), "release name"],
		[
			release({
				name: "release candidate",
				tag_name: "release candidate",
			}),
			"release name",
		],
		[release({ assets: [apk("notes.txt")] }), "unambiguous APK"],
		[
			release({
				assets: [{ ...apk(), browser_download_url: "not a URL" }],
			}),
			"unambiguous APK",
		],
		[
			release({
				assets: [
					apk("com.purple.coins_2026.9.22.apk"),
					apk("com.purple.coins_2026.9.22-x86.apk"),
				],
			}),
			"unambiguous APK",
		],
	])("rejects invalid release data", async (payload, message) => {
		setFetchResponse(payload);
		await expect(updateService.checkForUpdate("2026.9.21")).rejects.toThrow(
			message,
		);
	});

	it("skips releases without a valid APK when reading the release list", async () => {
		setFetchResponse([
			release({
				name: "zip-2026.09.28",
				tag_name: "zip-2026.09.28",
				assets: [apk("New.Folder.With.Items.zip")],
			}),
			release(),
		]);
		await expect(
			updateService.checkForUpdate("2026.9.21"),
		).resolves.toMatchObject({ version: "2026.9.22" });
		setFetchResponse([
			release({
				name: "zip-2026.09.28",
				tag_name: "zip-2026.09.28",
				assets: [apk("New.Folder.With.Items.zip")],
			}),
		]);
		await expect(updateService.checkForUpdate("2026.9.21")).rejects.toThrow(
			"release name",
		);
		setFetchResponse([]);
		await expect(updateService.checkForUpdate("2026.9.21")).rejects.toThrow(
			"latest release",
		);
	});

	it("reports GitHub failures and invalid app versions", async () => {
		setFetchResponse({}, 503);
		await expect(updateService.checkForUpdate("2026.9.21")).rejects.toThrow(
			"503",
		);
		await expect(
			updateService.checkForUpdate("not-a-version"),
		).rejects.toThrow("app version");
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("offline");
			}),
		);
		await expect(updateService.checkForUpdate("2026.9.21")).rejects.toThrow(
			"offline",
		);
	});

	it("downloads a complete APK and opens the Android installer", async () => {
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: "file://cache-dir/com.purple.coins_2026.9.22.apk",
		});
		mocks.getContentUriAsync.mockResolvedValue(
			"content://purplecoins/update.apk",
		);
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate({
			version: "2026.9.22",
			name: "com.purple.coins_2026.9.22.apk",
			downloadUrl:
				"https://github.com/purplevarun/purplecoins/releases/download/v2026.9.22/com.purple.coins_2026.9.22.apk",
			size: 123,
		});
		expect(mocks.downloadFileAsync).toHaveBeenCalledWith(
			"https://github.com/purplevarun/purplecoins/releases/download/v2026.9.22/com.purple.coins_2026.9.22.apk",
			expect.objectContaining({
				uri: "cache-dir/com.purple.coins_2026.9.22.apk",
			}),
			{ idempotent: true },
		);
		expect(mocks.getContentUriAsync).toHaveBeenCalledWith(
			"file://cache-dir/com.purple.coins_2026.9.22.apk",
		);
		expect(mocks.startActivityAsync).toHaveBeenCalledWith(
			"android.intent.action.VIEW",
			{
				data: "content://purplecoins/update.apk",
				type: "application/vnd.android.package-archive",
				flags: 1,
			},
		);
	});

	it.each([
		["update.apk", "update"],
		["update.APK", "update"],
		["update", "update"],
	])(
		"saves %s to a user-picked directory and installs it from there",
		async (name, fileName) => {
			mocks.downloadFileAsync.mockResolvedValue({
				exists: true,
				size: 123,
				uri: `file://cache-dir/${name}`,
			});
			mocks.requestDirectoryPermissionsAsync.mockResolvedValue({
				granted: true,
				directoryUri: "content://picked/Download",
			});
			mocks.readAsStringAsync.mockResolvedValue("YXBrLWJ5dGVz");
			mocks.createFileAsync.mockResolvedValue(
				`content://picked/Download/${name}`,
			);
			mocks.getInfoAsync.mockResolvedValue({ exists: true, size: 123 });
			mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
			await updateService.downloadAndInstallUpdate({
				version: "2026.9.22",
				name,
				downloadUrl: `https://example.com/${name}`,
				size: 123,
			});
			expect(
				mocks.getUriForDirectoryInRoot,
			).toHaveBeenCalledExactlyOnceWith("Download");
			expect(
				mocks.requestDirectoryPermissionsAsync,
			).toHaveBeenCalledExactlyOnceWith("content://root/Download");
			expect(mocks.readAsStringAsync).toHaveBeenCalledExactlyOnceWith(
				`file://cache-dir/${name}`,
				{ encoding: "base64", position: 0, length: 123 },
			);
			expect(mocks.createFileAsync).toHaveBeenCalledExactlyOnceWith(
				"content://picked/Download",
				fileName,
				"application/vnd.android.package-archive",
			);
			expect(mocks.safWriteAsStringAsync).toHaveBeenCalledExactlyOnceWith(
				`content://picked/Download/${name}`,
				"YXBrLWJ5dGVz",
				{ encoding: "base64", append: false },
			);
			expect(mocks.getInfoAsync).toHaveBeenCalledExactlyOnceWith(
				`content://picked/Download/${name}`,
			);
			expect(mocks.getContentUriAsync).not.toHaveBeenCalled();
			expect(mocks.startActivityAsync).toHaveBeenCalledExactlyOnceWith(
				"android.intent.action.VIEW",
				{
					data: `content://picked/Download/${name}`,
					type: "application/vnd.android.package-archive",
					flags: 1,
				},
			);
		},
	);

	it("installs from the cache when the directory picker is dismissed", async () => {
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: "file://cache-dir/update.apk",
		});
		mocks.getContentUriAsync.mockResolvedValue(
			"content://purplecoins/update.apk",
		);
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate(pendingRelease);
		expect(mocks.requestDirectoryPermissionsAsync).toHaveBeenCalled();
		expect(mocks.createFileAsync).not.toHaveBeenCalled();
		expect(mocks.safWriteAsStringAsync).not.toHaveBeenCalled();
		expect(mocks.startActivityAsync).toHaveBeenCalledExactlyOnceWith(
			"android.intent.action.VIEW",
			{
				data: "content://purplecoins/update.apk",
				type: "application/vnd.android.package-archive",
				flags: 1,
			},
		);
	});

	it("copies large APKs to the picked directory in chunks", async () => {
		const size = 6 * 1024 * 1024 + 42;
		mocks.files.set(cachedApkUri, size);
		mocks.requestDirectoryPermissionsAsync.mockResolvedValue({
			granted: true,
			directoryUri: "content://picked/Download",
		});
		mocks.createFileAsync.mockResolvedValue(
			"content://picked/Download/update.apk",
		);
		mocks.readAsStringAsync.mockResolvedValue("Y2h1bms=");
		mocks.getInfoAsync.mockResolvedValue({ exists: true, size });
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate({
			...pendingRelease,
			size,
		});
		expect(mocks.readAsStringAsync).toHaveBeenCalledTimes(2);
		expect(mocks.readAsStringAsync).toHaveBeenNthCalledWith(
			1,
			cachedApkUri,
			{ encoding: "base64", position: 0, length: 6 * 1024 * 1024 },
		);
		expect(mocks.readAsStringAsync).toHaveBeenNthCalledWith(
			2,
			cachedApkUri,
			{
				encoding: "base64",
				position: 6 * 1024 * 1024,
				length: 42,
			},
		);
		expect(mocks.safWriteAsStringAsync).toHaveBeenNthCalledWith(
			1,
			"content://picked/Download/update.apk",
			"Y2h1bms=",
			{ encoding: "base64", append: false },
		);
		expect(mocks.safWriteAsStringAsync).toHaveBeenNthCalledWith(
			2,
			"content://picked/Download/update.apk",
			"Y2h1bms=",
			{ encoding: "base64", append: true },
		);
	});

	it.each([
		[new Error("disk full"), "disk full"],
		[null, "not saved completely"],
	])(
		"cleans up the partial file when the copy fails (%s)",
		async (failure, message) => {
			mocks.downloadFileAsync.mockResolvedValue({
				exists: true,
				size: 123,
				uri: "file://cache-dir/update.apk",
			});
			mocks.requestDirectoryPermissionsAsync.mockResolvedValue({
				granted: true,
				directoryUri: "content://picked/Download",
			});
			mocks.createFileAsync.mockResolvedValue(
				"content://picked/Download/update.apk",
			);
			if (failure instanceof Error) {
				mocks.readAsStringAsync.mockRejectedValue(failure);
				mocks.safDeleteAsync.mockRejectedValue(
					new Error("cleanup failed"),
				);
			} else {
				mocks.getInfoAsync.mockResolvedValue({
					exists: true,
					size: 122,
				});
			}
			await expect(
				updateService.downloadAndInstallUpdate({
					version: "2026.9.22",
					name: "update.apk",
					downloadUrl: "https://example.com/update.apk",
					size: 123,
				}),
			).rejects.toThrow(message);
			expect(mocks.safDeleteAsync).toHaveBeenCalledExactlyOnceWith(
				"content://picked/Download/update.apk",
				{ idempotent: true },
			);
			expect(mocks.startActivityAsync).not.toHaveBeenCalled();
		},
	);

	it.each([
		[{ exists: false, size: 123, uri: "file://update.apk" }, "incomplete"],
		[{ exists: true, size: 122, uri: "file://update.apk" }, "incomplete"],
	])("rejects incomplete APK downloads", async (downloaded, message) => {
		mocks.downloadFileAsync.mockResolvedValue(downloaded);
		await expect(
			updateService.downloadAndInstallUpdate({
				version: "2026.9.22",
				name: "update.apk",
				downloadUrl: "https://example.com/update.apk",
				size: 123,
			}),
		).rejects.toThrow(message);
		expect(mocks.getContentUriAsync).not.toHaveBeenCalled();
		expect(mocks.startActivityAsync).not.toHaveBeenCalled();
	});

	it("does not open the installer when the download fails", async () => {
		mocks.downloadFileAsync.mockRejectedValue(new Error("network down"));
		await expect(
			updateService.downloadAndInstallUpdate(pendingRelease),
		).rejects.toThrow("network down");
		expect(mocks.getContentUriAsync).not.toHaveBeenCalled();
		expect(mocks.startActivityAsync).not.toHaveBeenCalled();
	});

	it("propagates content URI and installer failures", async () => {
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: "file://update.apk",
		});
		mocks.getContentUriAsync.mockRejectedValueOnce(new Error("uri failed"));
		await expect(
			updateService.downloadAndInstallUpdate({
				version: "2026.9.22",
				name: "update.apk",
				downloadUrl: "https://example.com/update.apk",
				size: 123,
			}),
		).rejects.toThrow("uri failed");
		mocks.getContentUriAsync.mockResolvedValue("content://update.apk");
		mocks.startActivityAsync.mockRejectedValueOnce(
			new Error("installer failed"),
		);
		await expect(
			updateService.downloadAndInstallUpdate({
				version: "2026.9.22",
				name: "update.apk",
				downloadUrl: "https://example.com/update.apk",
				size: 123,
			}),
		).rejects.toThrow("installer failed");
	});

	it("declares Android permission to request APK installation", () => {
		expect(appConfig.expo.android).toMatchObject({
			permissions: expect.arrayContaining([
				"android.permission.REQUEST_INSTALL_PACKAGES",
			]),
		});
	});

	it("opens a complete cached APK without downloading again", async () => {
		mocks.files.set(cachedApkUri, pendingRelease.size);
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: cachedApkUri,
		});
		mocks.getContentUriAsync.mockResolvedValue(
			"content://purplecoins/update.apk",
		);
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate(pendingRelease);
		expect(mocks.downloadFileAsync).not.toHaveBeenCalled();
		expect(mocks.getContentUriAsync).toHaveBeenCalledExactlyOnceWith(
			cachedApkUri,
		);
		expect(mocks.startActivityAsync).toHaveBeenCalledExactlyOnceWith(
			"android.intent.action.VIEW",
			{
				data: "content://purplecoins/update.apk",
				type: "application/vnd.android.package-archive",
				flags: 1,
			},
		);
	});

	it.each([
		[undefined, false],
		[0, false],
		[122, false],
		[124, false],
		[123, true],
	])("reports cached size %s as complete=%s", (cachedSize, expected) => {
		if (cachedSize !== undefined) {
			mocks.files.set(cachedApkUri, cachedSize);
		}
		expect(updateService.isUpdateDownloaded(pendingRelease)).toBe(expected);
	});

	it.each([undefined, 0, 122, 124])(
		"downloads again when the cached APK size is %s",
		async (cachedSize) => {
			if (cachedSize !== undefined) {
				mocks.files.set(cachedApkUri, cachedSize);
			}
			mocks.downloadFileAsync.mockResolvedValue({
				exists: true,
				size: 123,
				uri: cachedApkUri,
			});
			mocks.getContentUriAsync.mockResolvedValue(
				"content://purplecoins/update.apk",
			);
			mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
			await updateService.downloadAndInstallUpdate(pendingRelease);
			expect(mocks.downloadFileAsync).toHaveBeenCalledExactlyOnceWith(
				pendingRelease.downloadUrl,
				expect.objectContaining({ uri: cachedApkUri }),
				{ idempotent: true },
			);
			expect(mocks.startActivityAsync).toHaveBeenCalledExactlyOnceWith(
				"android.intent.action.VIEW",
				{
					data: "content://purplecoins/update.apk",
					type: "application/vnd.android.package-archive",
					flags: 1,
				},
			);
		},
	);

	it("does not reuse a cached APK from a different version", async () => {
		mocks.files.set("cache-dir/com.purple.coins_2026.9.21.apk", 123);
		expect(updateService.isUpdateDownloaded(pendingRelease)).toBe(false);
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: cachedApkUri,
		});
		mocks.getContentUriAsync.mockResolvedValue(
			"content://purplecoins/update.apk",
		);
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate(pendingRelease);
		expect(mocks.downloadFileAsync).toHaveBeenCalledExactlyOnceWith(
			pendingRelease.downloadUrl,
			expect.objectContaining({ uri: cachedApkUri }),
			{ idempotent: true },
		);
	});

	it("downloads again when the cached APK disappears before install", async () => {
		mocks.files.set(cachedApkUri, pendingRelease.size);
		expect(updateService.isUpdateDownloaded(pendingRelease)).toBe(true);
		mocks.files.clear();
		mocks.downloadFileAsync.mockResolvedValue({
			exists: true,
			size: 123,
			uri: cachedApkUri,
		});
		mocks.getContentUriAsync.mockResolvedValue(
			"content://purplecoins/update.apk",
		);
		mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
		await updateService.downloadAndInstallUpdate(pendingRelease);
		expect(mocks.downloadFileAsync).toHaveBeenCalledExactlyOnceWith(
			pendingRelease.downloadUrl,
			expect.objectContaining({ uri: cachedApkUri }),
			{ idempotent: true },
		);
	});

	it.each([
		["is cancelled", { resultCode: 0 }],
		["fails", new Error("installer failed")],
	])(
		"reuses the downloaded APK when the installer %s",
		async (_outcome, firstResult) => {
			mocks.downloadFileAsync.mockImplementation(async () => {
				mocks.files.set(cachedApkUri, 123);
				return { exists: true, size: 123, uri: cachedApkUri };
			});
			mocks.getContentUriAsync.mockResolvedValue(
				"content://purplecoins/update.apk",
			);
			if (firstResult instanceof Error) {
				mocks.startActivityAsync.mockRejectedValueOnce(firstResult);
			} else {
				mocks.startActivityAsync.mockResolvedValueOnce(firstResult);
			}
			mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });
			if (firstResult instanceof Error) {
				await expect(
					updateService.downloadAndInstallUpdate(pendingRelease),
				).rejects.toThrow("installer failed");
			} else {
				await updateService.downloadAndInstallUpdate(pendingRelease);
			}
			await updateService.downloadAndInstallUpdate(pendingRelease);
			expect(mocks.downloadFileAsync).toHaveBeenCalledExactlyOnceWith(
				pendingRelease.downloadUrl,
				expect.objectContaining({ uri: cachedApkUri }),
				{ idempotent: true },
			);
			expect(mocks.getContentUriAsync).toHaveBeenCalledTimes(2);
			expect(mocks.startActivityAsync).toHaveBeenCalledTimes(2);
			expect(mocks.files.get(cachedApkUri)).toBe(123);
		},
	);
});
