const FONT_FAMILY = "Rubik-SemiBold";

const APP_FONTS = {
	// eslint-disable-next-line @typescript-eslint/no-require-imports -- expo-font asset loading
	[FONT_FAMILY]: require(`../../assets/fonts/${FONT_FAMILY}.ttf`) as number,
} as const;

const typographyConstants = {
	APP_FONTS,
	FONT_FAMILY,
};

export default typographyConstants;
