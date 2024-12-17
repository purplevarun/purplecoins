import {
	CENTER,
	FIFTY_P,
	FONT_SIZE,
	LARGE_FONT_SIZE,
} from "../../../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "./TypeSelector";
import CustomButton from "../../../components/CustomButton";
import CategorySelector from "./CategorySelector";
import SourceSelector from "./SourceSelector";
import DestinationSelector from "./DestinationSelector";
import InvestmentSelector from "./InvestmentSelector";
import TripSelector from "./TripSelector";
import TransactionDatePicker from "./TransactionDatePicker";
import Vertical from "../../../components/Vertical";
import SourceRoutes from "../source/SourceRoutes";
import useTransactionStore from "./TransactionStore";
import useTransactionService from "./TransactionService";
import useSourceService from "../source/SourceService";
import useSourceStore from "../source/SourceStore";

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
				<CloseButton />
				<Vertical size={FONT_SIZE} />
				<CustomText
					text={"To add a transaction, you need to add a source"}
					alignSelf={CENTER}
				/>
				<CustomButton
					text={"Add Source"}
					width={FIFTY_P}
					onPress={() => {
						setRedirect(true);
						navigate(SourceRoutes.Add);
					}}
				/>
			</ScreenLayout>
		);
	}

	return (
		<ScreenLayout>
			<CloseButton />
			<Vertical />
			<CustomText
				text={"Add Transaction"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector type={type} setType={setType} transaction />
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
