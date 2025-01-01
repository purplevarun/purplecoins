import { StyleSheet } from "react-native";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	NINETY_P,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
} from "./constants.config";

const dropdownStyle = StyleSheet.create({
	selected: { alignSelf: CENTER },
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
	},
	renderItem: {
		padding: PADDING,
	},
	renderItemSelected: {
		backgroundColor: DISABLED_COLOR,
	},
	dropdown: {
		alignSelf: CENTER,
		width: NINETY_P,
		height: FONT_SIZE * 2.5,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	container: {
		backgroundColor: BACKGROUND_COLOR,
		borderWidth: 1,
		borderTopRightRadius: 3,
		borderTopLeftRadius: 3,
	},
	itemText: {
		color: PRIMARY_COLOR,
	},
	itemContainer: {
		backgroundColor: BACKGROUND_COLOR,
	},
	selectedText: {
		fontSize: FONT_SIZE,
		color: PRIMARY_COLOR,
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR,
	},
	renderSelected: {
		borderWidth: 2,
		borderColor: DISABLED_COLOR,
		padding: PADDING / 2,
		marginHorizontal: PADDING / 3,
		marginTop: PADDING / 2,
		left: FONT_SIZE / 1.4,
		borderRadius: BORDER_RADIUS / 1.5,
	},
});

export default dropdownStyle;
