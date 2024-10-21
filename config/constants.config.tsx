import { Dimensions } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
const FONT_SCALE = Dimensions.get("window").fontScale;
export const BOTTOM_TAB_HEIGHT = SCREEN_HEIGHT * 0.08;
export const TOP_TAB_HEIGHT = SCREEN_HEIGHT * 0.05;
export const HEADER_HEIGHT = SCREEN_HEIGHT * 0.06;
export const FONT_SIZE = (SCREEN_WIDTH * 0.06) / FONT_SCALE;
export const USABLE_FINANCE_SCREEN_HEIGHT =
	SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT - TOP_TAB_HEIGHT - HEADER_HEIGHT;
export const USABLE_SCREEN_HEIGHT =
	SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT - HEADER_HEIGHT;
export const LARGE_FONT_SIZE = FONT_SIZE * 1.5;
export const LOADER_SIZE = SCREEN_WIDTH / 2;
export const SMALL_FONT_SIZE = FONT_SIZE * 0.85;

export const FLEX_ONE = 1;
export const PADDING = FONT_SIZE / 2;
export const MARGIN = FONT_SIZE / 4;
export const BORDER_RADIUS = FONT_SIZE / 2;
export const CENTER = "center";
export const FLEX_ROW = "row";
export const SPACE_EVENLY = "space-evenly";
export const SPACE_BETWEEN = "space-between";

export const SCREEN_OPTIONS: NativeStackNavigationOptions = {
	headerShown: false,
	animation: "ios",
};
