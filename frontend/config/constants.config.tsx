import { Dimensions } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const FONT_SCALE = Dimensions.get("window").fontScale;

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const BOTTOM_TAB_HEIGHT = SCREEN_HEIGHT * 0.08;
export const TOP_TAB_HEIGHT = SCREEN_HEIGHT * 0.05;
export const HEADER_HEIGHT = SCREEN_HEIGHT * 0.05;
export const USABLE_SCREEN_HEIGHT =
	SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT - TOP_TAB_HEIGHT - HEADER_HEIGHT;
export const FONT_SIZE = (SCREEN_WIDTH * 0.05) / FONT_SCALE;
export const MODAL_HEIGHT = SCREEN_HEIGHT * 0.15;
export const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
export const MODAL_BUTTON_WIDTH = SCREEN_WIDTH * 0.2;
export const LARGE_FONT_SIZE = FONT_SIZE * 1.4;
export const LOADER_SIZE = SCREEN_WIDTH * 0.5;
export const SMALL_FONT_SIZE = FONT_SIZE * 0.8;
export const FLEX_ONE = 1;
export const PADDING = FONT_SIZE * 0.5;
export const MARGIN = FONT_SIZE * 0.25;
export const BORDER_RADIUS = FONT_SIZE * 0.25;
export const BORDER_WIDTH = 2;
export const CENTER = "center";
export const FLEX_ROW = "row";
export const FLEX_COLUMN = "column";
export const SPACE_EVENLY = "space-evenly";
export const SPACE_BETWEEN = "space-between";
export const PADDING_TOP_ADD_SCREEN = FONT_SIZE * 0.35;
export const NINETY_P = "90%";
export const FIFTY_P = "50%";
export const SEVENTY_P = "70%";
export const HUNDRED_P = "100%";
export const FORTY_EIGHT_P = "48%";
export const UBUNTU_FONT = "Ubuntu";
export const FLEX_START = "flex-start";
export const FLEX_END = "flex-end";
export const ABSOLUTE = "absolute";
export const API_URL = __DEV__
	? process.env.EXPO_PUBLIC_API_URL
	: "https://purplecoins.onrender.com";
export const DB_NAME = "purplecoins.db";
export const SCREEN_OPTIONS: NativeStackNavigationOptions = {
	headerShown: false,
	animation: "ios",
};
export const MINIMUM_LENGTH = 4;
