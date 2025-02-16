import RadioButtons from "../../components/button/add_screen/RadioButtons";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	YELLOW_COLOR,
} from "../../constants/config/colors.config";
import TransactionType from "../../constants/enums/TransactionType";

interface ITypeSelector {
	type: TransactionType;
	setType: (val: TransactionType) => void;
}

const ExpenseData = {
	[TransactionType.GENERAL]: { name: "General", color: GREEN_COLOR },
	[TransactionType.TRANSFER]: { name: "Transfer", color: BLUE_COLOR },
	[TransactionType.INVESTMENT]: { name: "Investment", color: YELLOW_COLOR },
};

const TransactionTypeSelector = ({ type, setType }: ITypeSelector) => {
	const radioButtonData = Object.keys(TransactionType).map((key, index) => {
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
		const selectedButton = radioButtonData.find((btn) => btn.id === id);
		if (selectedButton) setType(selectedButton.value);
	};

	return (
		<RadioButtons
			data={radioButtonData}
			onPress={handlePress}
			selectedId={radioButtonData.find((btn) => btn.value === type)?.id}
		/>
	);
};

export default TransactionTypeSelector;
