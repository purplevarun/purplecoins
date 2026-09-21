type GitHubReleaseAsset = Readonly<{
	name: string;
	size: number;
	browser_download_url: string;
}>;

export type { GitHubReleaseAsset as default };
