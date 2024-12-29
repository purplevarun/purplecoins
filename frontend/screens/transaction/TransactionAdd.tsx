import { useState } from "react";
import { RED_COLOR } from "../../config/colors.config";
import {
	FLEX_START,
	PADDING,
	SMALL_FONT_SIZE,
} from "../../config/constants.config";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import ScreenLayout from "../../components/ScreenLayout";
import InvestmentSelector from "../finance/transaction/InvestmentSelector";
import useSourceService from "../source/SourceService";
import CategorySelector from "./CategorySelector";
import DestinationSelector from "./DestinationSelector";
import SourceSelector from "./SourceSelector";
import TransactionDatePicker from "./TransactionDatePicker";
import useTransactionService from "./TransactionService";
import useTransactionStore from "./TransactionStore";
import TripSelector from "./TripSelector";
import TypeSelector from "./TypeSelector";
import CustomText from "../../components/CustomText";
import { View } from "react-native";

const TransactionAdd = ({ route }: any) => {
	const transactionId = route.params?.transactionId ?? null;
	const { amount, reason, setReason, type, setAmount, setType, sourceId } =
		useTransactionStore();
	const { addNewTransaction, submitEnabled } = useTransactionService();
	const { fetchSource } = useSourceService();
	const [insufficientBalance, setInsufficientBalance] = useState(false);
	const onPress = () => {
		const source = fetchSource(sourceId);
		if (parseInt(amount) > source.currentAmount) {
			setInsufficientBalance(true);
		} else {
			addNewTransaction(transactionId);
			setInsufficientBalance(false);
		}
	};
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
			<InsufficientBalance insufficientBalance={insufficientBalance} />
			<SourceSelector />
			<DestinationSelector />
			<CategorySelector />
			<InvestmentSelector />
			<TripSelector />
			<CustomButton disabled={!submitEnabled} onPress={onPress} />
		</ScreenLayout>
	);
};

const InsufficientBalance = ({
								 insufficientBalance,
							 }: {
	insufficientBalance: boolean;
}) => {
	if (insufficientBalance)
		return (
			<View
				style={{
					padding: PADDING / 2,
					paddingBottom: 0,
					paddingLeft: PADDING * 2,
				}}
			>
				<CustomText
					text={"Insufficient Balance"}
					color={RED_COLOR}
					alignSelf={FLEX_START}
					fontSize={SMALL_FONT_SIZE}
				/>
			</View>
		);
};

export default TransactionAdd;
