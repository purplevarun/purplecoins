import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR
} from "../../../config/colors.config";
import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	NINETY_P,
	PADDING,
	PADDING_TOP_ADD_SCREEN
} from "../../../config/constants.config";
import RenderItem from "../../../interfaces/RenderItem";
import CustomText from "../../../components/CustomText";
import useDatabase from "../../../util/database/DatabaseFunctions";
import useTransactionStore from "./TransactionStore";

const SourceSelector = () => {
	const { transactionSourceId, setTransactionSourceId } = useTransactionStore();
	const { getSources } = useDatabase();

	const sourceModels = getSources().map((s) => ({
		label: s.name,
		value: s.id
	}));

	const item = (item: RenderItem) => {
		const backgroundColor =
			transactionSourceId === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
		return (
			<View
				style={{
					backgroundColor,
					padding: PADDING
				}}
			>
				<CustomText text={item.label} color={PRIMARY_COLOR} />
			</View>
		);
	};

	return (
		<View style={styles.wrapper}>
			<Dropdown
				placeholder={"Select Source *"}
				labelField={"label"}
				valueField={"value"}
				data={sourceModels}
				value={transactionSourceId}
				onChange={(item) => setTransactionSourceId(item.value)}
				renderItem={item}
				style={styles.dropdown}
				placeholderStyle={styles.placeholder}
				selectedTextStyle={styles.selectedText}
				itemContainerStyle={styles.itemContainer}
				containerStyle={styles.container}
				itemTextStyle={styles.itemText}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN
	},
	dropdown: {
		alignSelf: CENTER,
		width: NINETY_P,
		height: FONT_SIZE * 2.5,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR
	},
	container: {
		backgroundColor: BACKGROUND_COLOR,
		borderWidth: 1,
		borderTopRightRadius: 3,
		borderTopLeftRadius: 3
	},
	itemText: {
		color: PRIMARY_COLOR
	},
	itemContainer: {
		backgroundColor: BACKGROUND_COLOR
	},
	selectedText: {
		fontSize: FONT_SIZE,
		color: PRIMARY_COLOR
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR
	}
});

export default SourceSelector;
