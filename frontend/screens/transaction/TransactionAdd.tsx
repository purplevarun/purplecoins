import CustomInput from "../../components/CustomInput";
import ScreenLayout from "../../components/ScreenLayout";
import TypeSelector from "./TypeSelector";
import CustomButton from "../../components/CustomButton";
import CategorySelector from "./CategorySelector";
import SourceSelector from "./SourceSelector";
import DestinationSelector from "./DestinationSelector";
import TripSelector from "./TripSelector";
import TransactionDatePicker from "./TransactionDatePicker";
import useTransactionStore from "./TransactionStore";
import useTransactionService from "./TransactionService";
import InvestmentSelector from "../finance/transaction/InvestmentSelector";

const TransactionAdd = ({ route }: any) => {
	const transactionId = route.params?.transactionId ?? null;
	const { amount, reason, setReason, type, setAmount, setType } =
		useTransactionStore();
	const { addNewTransaction, submitEnabled } = useTransactionService();
	return (
		<ScreenLayout>
			<TypeSelector type={type} setType={setType} />
			<CustomInput
				name={"Amount"}
				value={amount}
				setValue={setAmount}
				numeric
			/>
			<CustomInput name={"Reason"} value={reason} setValue={setReason} />
			<TransactionDatePicker />
			<SourceSelector />
			<DestinationSelector />
			<CategorySelector />
			<InvestmentSelector />
			<TripSelector />
			<CustomButton
				disabled={!submitEnabled}
				onPress={() => addNewTransaction(transactionId)}
			/>
		</ScreenLayout>
	);
};

export default TransactionAdd;
