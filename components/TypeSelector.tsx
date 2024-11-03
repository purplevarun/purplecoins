import {
	CENTER,
	FLEX_ROW,
	HUNDRED_P,
	PADDING,
	SPACE_EVENLY,
} from "../config/constants.config";
import { StyleSheet } from "react-native";
import { PRIMARY_COLOR } from "../config/colors.config";
import ExpenseType, { ExpenseData } from "../types/ExpenseType";
import RadioGroup from "react-native-radio-buttons-group";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";

const TypeSelector = ({ transaction = false }: { transaction?: boolean }) => {
	const { type, setType } = useTransactionStore();

	const radioButtons = Object.keys(ExpenseType).map((key, index) => {
		const type = ExpenseType[key as keyof typeof ExpenseType];
		const { name, color } = ExpenseData[type];
		return {
			id: index.toString(),
			label: name,
			value: type,
			color: color,
		};
	});

	const handlePress = (id: string) => {
		const selectedButton = radioButtons.find((btn) => btn.id === id);
		if (selectedButton) {
			setType(selectedButton.value);
		}
	};

	return (
		<RadioGroup
			radioButtons={transaction ? radioButtons : radioButtons.slice(0, 2)}
			onPress={handlePress}
			selectedId={radioButtons.find((btn) => btn.value === type)?.id}
			layout={FLEX_ROW}
			containerStyle={styles.container}
			labelStyle={styles.label}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: PADDING,
		alignSelf: CENTER,
		justifyContent: SPACE_EVENLY,
		width: HUNDRED_P,
	},
	label: { color: PRIMARY_COLOR },
});

export default TypeSelector;
