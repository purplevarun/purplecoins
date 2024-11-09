import ExpenseType, { ExpenseData } from "../types/ExpenseType";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import RadioButtonGroup from "./RadioButtonGroup";

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
		<RadioButtonGroup
			radioButtons={transaction ? radioButtons : radioButtons.slice(0, 2)}
			onPress={handlePress}
			selectedId={radioButtons.find((btn) => btn.value === type)?.id}
		/>
	);
};

export default TypeSelector;
