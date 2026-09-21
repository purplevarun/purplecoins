const GITHUB_RELEASE_API_URL =
	"https://api.github.com/repos/purplevarun/purplecoins/releases/latest";
const GITHUB_RELEASE_DOWNLOAD_PREFIX =
	"https://github.com/purplevarun/purplecoins/releases/download/";
const APK_MIME_TYPE = "application/vnd.android.package-archive";
const INSTALL_APK_ACTION = "android.intent.action.VIEW";
const GRANT_READ_URI_PERMISSION_FLAG = 1;

const updateConstants = {
	APK_MIME_TYPE,
	GITHUB_RELEASE_API_URL,
	GITHUB_RELEASE_DOWNLOAD_PREFIX,
	GRANT_READ_URI_PERMISSION_FLAG,
	INSTALL_APK_ACTION,
};

export default updateConstants;
