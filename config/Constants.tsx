import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCALE = Dimensions.get("window").scale;
const FONT_SCALE = Dimensions.get("window").fontScale;
export const BOTTOM_TAB_HEIGHT = SCREEN_HEIGHT * 0.08;
export const TOP_TAB_HEIGHT = SCREEN_HEIGHT * 0.06;
export const HEADER_HEIGHT = SCREEN_HEIGHT * 0.07;
export const FONT_SIZE = SCREEN_WIDTH * 0.06;
export const USABLE_FINANCE_SCREEN_HEIGHT =
	SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT - TOP_TAB_HEIGHT - HEADER_HEIGHT;
export const USABLE_SCREEN_HEIGHT =
	SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT - HEADER_HEIGHT;
export const HEADER_ICON_SIZE = FONT_SIZE * 1.5;
export const LOADER_SIZE = SCREEN_WIDTH / 2;
//
export const flex = 1;
export const padding = FONT_SIZE / 2;
