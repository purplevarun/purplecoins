const GITHUB_RELEASE_API_URL =
	"https://api.github.com/repos/purplevarun/coins/releases?per_page=10";
const GITHUB_RELEASE_DOWNLOAD_PREFIX =
	"https://github.com/purplevarun/coins/releases/download/";
const APK_MIME_TYPE = "application/vnd.android.package-archive";
const APK_FILE_EXTENSION = ".apk";
const DOWNLOADS_DIRECTORY_NAME = "Download";
const INSTALL_APK_ACTION = "android.intent.action.VIEW";
const GRANT_READ_URI_PERMISSION_FLAG = 1;
const COPY_CHUNK_BYTES = 6 * 1024 * 1024;

const updateConstants = {
	APK_FILE_EXTENSION,
	APK_MIME_TYPE,
	COPY_CHUNK_BYTES,
	DOWNLOADS_DIRECTORY_NAME,
	GITHUB_RELEASE_API_URL,
	GITHUB_RELEASE_DOWNLOAD_PREFIX,
	GRANT_READ_URI_PERMISSION_FLAG,
	INSTALL_APK_ACTION,
};

export default updateConstants;
