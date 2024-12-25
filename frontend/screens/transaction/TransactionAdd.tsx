import { CENTER, FIFTY_P, FONT_SIZE } from "../../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../components/CustomText";
import CustomInput from "../../components/CustomInput";
import ScreenLayout from "../../components/ScreenLayout";
import TypeSelector from "./TypeSelector";
import CustomButton from "../../components/CustomButton";
import CategorySelector from "./CategorySelector";
import SourceSelector from "./SourceSelector";
import DestinationSelector from "./DestinationSelector";
import TripSelector from "./TripSelector";
import TransactionDatePicker from "./TransactionDatePicker";
import Vertical from "../../components/Vertical";
import useTransactionStore from "./TransactionStore";
import useTransactionService from "./TransactionService";
import useSourceService from "../source/SourceService";
import useSourceStore from "../source/SourceStore";
import Routes from "../../Routes";
import InvestmentSelector from "../finance/transaction/InvestmentSelector";

const TransactionAdd = () => {
	const { navigate } = useNavigation<any>();
	const { amount, reason, setReason, type, setAmount, setType } =
		useTransactionStore();
	const { setRedirect } = useSourceStore();
	const { fetchSources } = useSourceService();
	const { addNewTransaction, submitEnabled } = useTransactionService();

	if (fetchSources().length === 0) {
		return (
			<ScreenLayout>
				<Vertical size={FONT_SIZE * 2} />
				<CustomText
					text={"To add a transaction, you must first add a source"}
					alignSelf={CENTER}
				/>
				<CustomButton
					text={"Add Source"}
					width={FIFTY_P}
					onPress={() => {
						setRedirect(true);
						navigate(Routes.Source.Add);
					}}
				/>
			</ScreenLayout>
		);
	}

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
				onPress={addNewTransaction}
			/>
		</ScreenLayout>
	);
};

export default TransactionAdd;
