import RadioButtons from "../../components/buttons/add_screen/RadioButtons";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	YELLOW_COLOR,
} from "../../constants/colors.config";
import Type from "../../constants/enums/Type";

interface ITypeSelector {
	type: Type;
	setType: (val: Type) => void;
}

const ExpenseData = {
	[Type.GENERAL]: { name: "General", color: GREEN_COLOR },
	[Type.TRANSFER]: { name: "Transfer", color: BLUE_COLOR },
	[Type.INVESTMENT]: { name: "Investment", color: YELLOW_COLOR },
};

const TransactionTypeSelector = ({ type, setType }: ITypeSelector) => {
	const radioButtonData = Object.keys(Type).map((key, index) => {
		const type = Type[key as keyof typeof Type];
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
