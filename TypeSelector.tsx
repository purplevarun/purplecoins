import RadioButtonGroup from "./RadioButtonGroup";
import TransactionType from "./TransactionType";
import { BLUE_COLOR, GREEN_COLOR, YELLOW_COLOR } from "./colors.config";

interface ITypeSelector {
	type: TransactionType;
	setType: (val: TransactionType) => void;
}

const ExpenseData = {
	[TransactionType.GENERAL]: { name: "General", color: GREEN_COLOR },
	[TransactionType.TRANSFER]: { name: "Transfer", color: BLUE_COLOR },
	[TransactionType.INVESTMENT]: { name: "Investment", color: YELLOW_COLOR },
};

const TypeSelector = ({ type, setType }: ITypeSelector) => {
	const radioButtons = Object.keys(TransactionType).map((key, index) => {
		const type = TransactionType[key as keyof typeof TransactionType];
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
		if (selectedButton) setType(selectedButton.value);
	};

	return (
		<RadioButtonGroup
			radioButtons={radioButtons}
			onPress={handlePress}
			selectedId={radioButtons.find((btn) => btn.value === type)?.id}
		/>
	);
};

export default TypeSelector;
