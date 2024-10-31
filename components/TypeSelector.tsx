import { CENTER, PADDING } from "../config/constants.config";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../config/colors.config";
import RadioGroup from "react-native-radio-buttons-group";
import ExpenseType from "../types/ExpenseType";

const Ids = { One: "1", Two: "2", Three: "3" };

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
			id: Ids.One,
			label: "Expense",
			value: ExpenseType.EXPENSE,
			color: RED_COLOR,
		},
		{
			id: Ids.Two,
			label: "Income",
			value: ExpenseType.INCOME,
			color: GREEN_COLOR,
		},
		...(enableTransfer
			? [
					{
						id: Ids.Three,
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
