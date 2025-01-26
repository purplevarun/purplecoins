import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";

const FONT_SCALE = Dimensions.get("screen").fontScale;
export const SCREEN_WIDTH = Dimensions.get("screen").width;
export const SCREEN_HEIGHT = Dimensions.get("screen").height;
export const HEADER_HEIGHT = SCREEN_HEIGHT * 0.07;
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
export const SPACE_EVENLY = "space-evenly";
export const SPACE_BETWEEN = "space-between";
export const PADDING_TOP_ADD_SCREEN = FONT_SIZE * 0.35;
export const UBUNTU_FONT = "Ubuntu";
export const FLEX_START = "flex-start";
export const ABSOLUTE = "absolute";
export const DB_NAME = "purplecoins.db";
export const SCREEN_OPTIONS: NativeStackNavigationOptions = {
	headerShown: false,
	animation: "fade",
};
export const DB_FILE_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
export const TAB_BAR_POSITION = "bottom";
