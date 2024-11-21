import {
	CENTER, FIFTY_P, FONT_SIZE,
	LARGE_FONT_SIZE
} from "../../../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import TransactionRoutes from "./TransactionRoutes";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../../../components/TypeSelector";
import CustomButton from "../../../components/CustomButton";
import CategorySelector from "../../../components/CategorySelector";
import SourceSelector from "../../../components/SourceSelector";
import DestinationSelector from "../../../components/DestinationSelector";
import InvestmentSelector from "../../../components/InvestmentSelector";
import TripSelector from "../../../components/TripSelector";
import useDatabase from "../../../util/database/DatabaseFunctions";
import TransactionDatePicker from "./TransactionDatePicker";
import Vertical from "../../../components/Vertical";
import ExpenseType from "../../../types/ExpenseType";
import SourceRoutes from "../source/SourceRoutes";
import useStore from "../../../util/Zustand";

const TransactionAdd = () => {
	const { navigate } = useNavigation<any>();
	const {
		transactionAmount,
		transactionReason,
		setTransactionReason,
		setTransactionCategoryIds,
		transactionType,
		setTransactionAmount,
		transactionSourceId,
		transactionDestinationId,
		transactionInvestmentId,
		setTransactionTripIds,
		setTransactionSourceId,
		setTransactionDestinationId,
		setTransactionInvestmentId,
		setTransactionDate,
		transactionDate,
		setTransactionType
	} = useStore();

	const { getSources, createTransaction } = useDatabase();
	const sources = getSources();

	if (sources.length === 0) {
		return <ScreenLayout>
			<CloseButton path={TransactionRoutes.Main} />
			<Vertical size={FONT_SIZE} />
			<CustomText text={"To add a transaction, you need to add a source"} alignSelf={CENTER} />
			<CustomButton text={"Add Source"} width={FIFTY_P} onPress={() => navigate(SourceRoutes.Add)} />
		</ScreenLayout>;
	}

	const enabled = useMemo(() => {
		const amountInt = parseInt(transactionAmount);
		if (isNaN(amountInt)) return false;
		if (transactionType === ExpenseType.EXPENSE || transactionType === ExpenseType.INCOME) {
			return amountInt > 0 && transactionReason.length > 0 && transactionSourceId.length > 0;
		}
		if (transactionType === ExpenseType.TRANSFER) {
			return amountInt > 0 && transactionSourceId.length > 0 && transactionDestinationId.length > 0;
		}
		if (transactionType === ExpenseType.INVESTMENT) {
			return amountInt > 0 && transactionSourceId.length > 0 && transactionInvestmentId.length > 0;
		}
		return false;
	}, [transactionAmount, transactionReason, transactionSourceId, transactionDestinationId, transactionInvestmentId]);

	const handlePress = () => {
		createTransaction(transactionAmount, transactionReason, transactionType, transactionDate, transactionSourceId, transactionDestinationId, transactionInvestmentId);
		setTransactionAmount("");
		setTransactionReason("");
		setTransactionSourceId("");
		setTransactionDestinationId("");
		setTransactionInvestmentId("");
		setTransactionCategoryIds([]);
		setTransactionTripIds([]);
		setTransactionDate(new Date());
		navigate(TransactionRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={TransactionRoutes.Main} />
			<Vertical />
			<CustomText
				text={"Add Transaction"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector type={transactionType} setType={setTransactionType} transaction />
			<CustomInput
				name={"Amount"}
				value={transactionAmount}
				setValue={setTransactionAmount}
				numeric
				required
			/>
			<CustomInput
				name={"Reason"}
				value={transactionReason}
				setValue={setTransactionReason}
				required
			/>
			<TransactionDatePicker />
			<SourceSelector />
			<DestinationSelector />
			<CategorySelector />
			<InvestmentSelector />
			<TripSelector />
			<CustomButton disabled={!enabled} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default TransactionAdd;
