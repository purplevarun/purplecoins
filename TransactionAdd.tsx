import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import CategorySelector from "./CategorySelector";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import CustomText from "./CustomText";
import DestinationSelector from "./DestinationSelector";
import Header from "./Header";
import InvestmentSelector from "./InvestmentSelector";
import ScreenLayout from "./ScreenLayout";
import SourceSelector from "./SourceSelector";
import TransactionDatePicker from "./TransactionDatePicker";
import useTransactionService from "./TransactionService";
import useTransactionStore from "./TransactionStore";
import TransactionType from "./TransactionType";
import TripSelector from "./TripSelector";
import TypeSelector from "./TypeSelector";
import { RED_COLOR } from "./colors.config";
import { FLEX_START, PADDING, SMALL_FONT_SIZE } from "./constants.config";
import useSource from "./main/domains/source/useSource";

const TransactionAdd = ({ route }: any) => {
	const transactionId = route.params?.transactionId ?? null;
	const { amount, reason, setReason, type, setAmount, setType, sourceId } =
		useTransactionStore();
	const { addNewTransaction, submitEnabled } = useTransactionService();
	const { fetchOneSource } = useSource(sourceId);
	const [insufficientBalance, setInsufficientBalance] = useState(false);
	const { navigate } = useNavigation<any>();
	const onPress = () => {
		const source = fetchOneSource();
		if (
			parseInt(amount) > source.amount &&
			type === TransactionType.EXPENSE
		) {
			setInsufficientBalance(true);
		} else {
			addNewTransaction(transactionId);
			setInsufficientBalance(false);
		}
	};
	return (
		<ScreenLayout>
			<Header handleClose={() => navigate("Transaction.Main")} />
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
