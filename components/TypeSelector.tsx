import { CENTER, PADDING } from "../config/constants.config";
import {
	BLUE_COLOR,
	DISABLED_COLOR,
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../config/colors.config";
import RadioGroup from "react-native-radio-buttons-group";
import ExpenseType from "../types/ExpenseType";

const TypeSelector = ({
	value,
	setValue,
	enableTransfer = false,
}: {
	value: ExpenseType;
	setValue: (newValue: ExpenseType) => void;
	enableTransfer?: boolean;
}) => {
	const radioButtons = [
		{
			id: "1",
			label: "Expense",
			value: ExpenseType.EXPENSE,
			color: RED_COLOR,
		},
		{
			id: "2",
			label: "Income",
			value: ExpenseType.INCOME,
			color: GREEN_COLOR,
		},
		...(enableTransfer
			? [
					{
						id: "3",
						label: "Transfer",
						value: ExpenseType.TRANSFER,
						color: BLUE_COLOR,
					},
				]
			: []),
	];

	return (
		<RadioGroup
			radioButtons={radioButtons}
			onPress={(id) => {
				const selectedButton = radioButtons.find(
					(btn) => btn.id === id,
				);
				if (selectedButton) {
					setValue(selectedButton.value);
				}
			}}
			selectedId={radioButtons.find((btn) => btn.value === value)?.id}
			layout="row"
			containerStyle={{ paddingVertical: PADDING, alignSelf: CENTER }}
			labelStyle={{ color: PRIMARY_COLOR }}
		/>
	);
};

export default TypeSelector;
