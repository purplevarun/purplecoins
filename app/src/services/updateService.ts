import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";

import updateConstants from "@/constants/updateConstants";
import AppError from "@/errors/AppError";
import type AppRelease from "@/types/AppRelease";
import type GitHubReleaseAsset from "@/types/GitHubReleaseAsset";
import { File, Paths } from "expo-file-system";

const {
	APK_FILE_EXTENSION,
	APK_MIME_TYPE,
	COPY_CHUNK_BYTES,
	DOWNLOADS_DIRECTORY_NAME,
	GITHUB_RELEASE_API_URL,
	GITHUB_RELEASE_DOWNLOAD_PREFIX,
	GRANT_READ_URI_PERMISSION_FLAG,
	INSTALL_APK_ACTION,
} = updateConstants;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const parseVersion = (value: unknown): string | null => {
	if (typeof value !== "string") return null;
	const normalized = value.trim().replace(/^[vV]/, "");
	return /^\d+(?:\.\d+)*$/.test(normalized) ? normalized : null;
};

const compareVersions = (left: string, right: string): number => {
	const leftParts = left.split(".").map(Number);
	const rightParts = right.split(".").map(Number);
	const segments = Math.max(leftParts.length, rightParts.length);
	for (let index = 0; index < segments; index += 1) {
		const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
		if (difference !== 0) {
			return Math.sign(difference);
		}
	}
	return 0;
};

const isApkAsset = (
	value: unknown,
	tagName: string,
): value is GitHubReleaseAsset => {
	if (
		!isRecord(value) ||
		typeof value.name !== "string" ||
		!value.name.toLowerCase().endsWith(".apk") ||
		value.state !== "uploaded" ||
		typeof value.size !== "number" ||
		!Number.isSafeInteger(value.size) ||
		value.size <= 0 ||
		typeof value.browser_download_url !== "string"
	) {
		return false;
	}
	try {
		const url = new URL(value.browser_download_url);
		return (
			`${url.origin}${url.pathname}` ===
				`${GITHUB_RELEASE_DOWNLOAD_PREFIX}${encodeURIComponent(tagName)}/${encodeURIComponent(value.name)}` &&
			url.search === "" &&
			url.hash === "" &&
			url.username === "" &&
			url.password === ""
		);
	} catch {
		return false;
	}
};

const parseRelease = (value: unknown): AppRelease => {
	if (
		!isRecord(value) ||
		value.draft !== false ||
		value.prerelease !== false ||
		typeof value.tag_name !== "string" ||
		!Array.isArray(value.assets)
	) {
		throw new AppError(
			"UPDATE_RELEASE_INVALID",
			"The latest release could not be read.",
		);
	}
	const tagName = value.tag_name;
	const version = parseVersion(value.name);
	if (!version) {
		throw new AppError(
			"UPDATE_VERSION_INVALID",
			"The release name is not a valid version.",
		);
	}
	const assets = value.assets.filter((asset) => isApkAsset(asset, tagName));
	const asset =
		assets.find((candidate) =>
			/(?:^|[-_.])universal(?:[-_.]|$)/i.test(candidate.name),
		) ?? (assets.length === 1 ? assets[0] : undefined);
	if (!asset) {
		throw new AppError(
			"UPDATE_APK_INVALID",
			"The latest release does not have an unambiguous APK.",
		);
	}
	return {
		version,
		name: asset.name,
		downloadUrl: asset.browser_download_url,
		size: asset.size,
	};
};

const checkForUpdate = async (
	currentVersion: string,
): Promise<AppRelease | null> => {
	const current = parseVersion(currentVersion);
	if (!current) {
		throw new AppError(
			"UPDATE_VERSION_INVALID",
			"This app version is not valid.",
		);
	}
	const response = await fetch(GITHUB_RELEASE_API_URL, {
		headers: { Accept: "application/vnd.github+json" },
	});
	if (!response.ok) {
		throw new AppError(
			"UPDATE_RELEASE_FETCH_FAILED",
			`Could not check for updates (${response.status}).`,
		);
	}
	const payload: unknown = await response.json();
	const candidates = Array.isArray(payload) ? payload : [payload];
	let lastError: unknown = new AppError(
		"UPDATE_RELEASE_INVALID",
		"The latest release could not be read.",
	);
	for (const candidate of candidates) {
		try {
			const release = parseRelease(candidate);
			return compareVersions(release.version, current) > 0
				? release
				: null;
		} catch (error) {
			lastError = error;
		}
	}
	throw lastError;
};

const getUpdateFile = (release: AppRelease): File =>
	new File(Paths.cache, release.name);

const isCompleteUpdate = (file: File, release: AppRelease): boolean =>
	file.exists && file.size === release.size;

const isUpdateDownloaded = (release: AppRelease): boolean =>
	isCompleteUpdate(getUpdateFile(release), release);

const copyToSafUri = async (
	sourceUri: string,
	destinationUri: string,
	size: number,
): Promise<void> => {
	for (let offset = 0; offset < size; offset += COPY_CHUNK_BYTES) {
		const length = Math.min(COPY_CHUNK_BYTES, size - offset);
		const chunk = await FileSystem.readAsStringAsync(sourceUri, {
			encoding: FileSystem.EncodingType.Base64,
			position: offset,
			length,
		});
		await FileSystem.StorageAccessFramework.writeAsStringAsync(
			destinationUri,
			chunk,
			{ encoding: FileSystem.EncodingType.Base64, append: offset > 0 },
		);
	}
};

const saveUpdateToUserDirectory = async (
	downloaded: File,
	release: AppRelease,
): Promise<string | null> => {
	const permission =
		await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
			FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
				DOWNLOADS_DIRECTORY_NAME,
			),
		);
	if (!permission.granted) {
		return null;
	}
	const uri = await FileSystem.StorageAccessFramework.createFileAsync(
		permission.directoryUri,
		release.name.toLowerCase().endsWith(APK_FILE_EXTENSION)
			? release.name.slice(0, -APK_FILE_EXTENSION.length)
			: release.name,
		APK_MIME_TYPE,
	);
	try {
		await copyToSafUri(downloaded.uri, uri, release.size);
		const info = await FileSystem.getInfoAsync(uri);
		if (!info.exists || info.size !== release.size) {
			throw new AppError(
				"UPDATE_COPY_INCOMPLETE",
				"The APK was not saved completely.",
			);
		}
	} catch (caughtError: unknown) {
		await FileSystem.StorageAccessFramework.deleteAsync(uri, {
			idempotent: true,
		}).catch(() => undefined);
		throw caughtError;
	}
	return uri;
};

const downloadAndInstallUpdate = async (release: AppRelease): Promise<void> => {
	const destination = getUpdateFile(release);
	const downloaded = isCompleteUpdate(destination, release)
		? destination
		: await File.downloadFileAsync(release.downloadUrl, destination, {
				idempotent: true,
			});
	if (!isCompleteUpdate(downloaded, release)) {
		throw new AppError(
			"UPDATE_DOWNLOAD_FAILED",
			"The APK download was incomplete.",
		);
	}
	const contentUri =
		(await saveUpdateToUserDirectory(downloaded, release)) ??
		(await FileSystem.getContentUriAsync(downloaded.uri));
	await IntentLauncher.startActivityAsync(INSTALL_APK_ACTION, {
		data: contentUri,
		type: APK_MIME_TYPE,
		flags: GRANT_READ_URI_PERMISSION_FLAG,
	});
};

const updateService = {
	checkForUpdate,
	downloadAndInstallUpdate,
	isUpdateDownloaded,
};

export default updateService;
