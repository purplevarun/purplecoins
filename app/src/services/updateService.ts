import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";

import updateConstants from "@/constants/updateConstants";
import AppError from "@/errors/AppError";
import type AppRelease from "@/types/AppRelease";
import type GitHubReleaseAsset from "@/types/GitHubReleaseAsset";
import { File, Paths } from "expo-file-system";

const {
	APK_MIME_TYPE,
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
	const release = parseRelease(await response.json());
	return release.version === current ? null : release;
};

const downloadAndInstallUpdate = async (release: AppRelease): Promise<void> => {
	const destination = new File(Paths.cache, release.name);
	const downloaded = await File.downloadFileAsync(
		release.downloadUrl,
		destination,
		{
			idempotent: true,
		},
	);
	if (!downloaded.exists || downloaded.size !== release.size) {
		throw new AppError(
			"UPDATE_DOWNLOAD_FAILED",
			"The APK download was incomplete.",
		);
	}
	const contentUri = await FileSystem.getContentUriAsync(downloaded.uri);
	await IntentLauncher.startActivityAsync(INSTALL_APK_ACTION, {
		data: contentUri,
		type: APK_MIME_TYPE,
		flags: GRANT_READ_URI_PERMISSION_FLAG,
	});
};

const updateService = {
	checkForUpdate,
	downloadAndInstallUpdate,
};

export default updateService;
