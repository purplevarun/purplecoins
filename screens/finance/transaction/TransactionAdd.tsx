import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "../../../util/HelperFunctions";
import { useQuery, useRealm } from "@realm/react";
import TransactionRoutes from "./TransactionRoutes";
import useTransactionStore from "./TransactionStore";
import UserModel from "../../../models/UserModel";
import TransactionModel from "../../../models/TransactionModel";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../../../components/TypeSelector";
import CustomButton from "../../../components/CustomButton";
import CategorySelector from "../../../components/CategorySelector";
import SourceModel from "../../../models/SourceModel";
import SourceSelector from "../../../components/SourceSelector";
import ExpenseType from "../../../types/ExpenseType";
import DestinationSelector from "../../../components/DestinationSelector";
import InvestmentSelector from "../../../components/InvestmentSelector";
import InvestmentModel from "../../../models/InvestmentModel";
import TripSelector from "../../../components/TripSelector";

const TransactionAdd = () => {
	const realm = useRealm();
	const userId = useQuery(UserModel)[0]?.id;
	const { navigate } = useNavigation<any>();
	const {
		amount,
		reason,
		setReason,
		setCategories,
		categories,
		type,
		setAmount,
		source,
		destination,
		investment,
		trips,
		setTrips,
		setSource,
		setDestination,
		setInvestment,
	} = useTransactionStore();

	const sourceModel = useQuery(SourceModel).filter(
		(sourceModel) => sourceModel.id === source,
	)[0];
	const destinationModel = useQuery(SourceModel).filter(
		(sourceModel) => sourceModel.id === destination,
	)[0];
	const investmentModel = useQuery(InvestmentModel).filter(
		(investmentModel) => investmentModel.id === investment,
	)[0];

	const isEnabled = () => {
		if (type === ExpenseType.EXPENSE || type === ExpenseType.INCOME) {
			try {
				const amountInt = new Function(`return ${amount}`)();
				if (isNaN(amountInt)) return false;
				return amountInt > 0 && reason.length > 0 && source.length > 0;
			} catch {
				return false;
			}
		}
		if (type === ExpenseType.TRANSFER) {
			try {
				const amountInt = new Function(`return ${amount}`)();
				if (isNaN(amountInt)) return false;
				return (
					amountInt > 0 && source.length > 0 && destination.length > 0
				);
			} catch {
				return false;
			}
		}
		if (type === ExpenseType.INVESTMENT) {
			try {
				const amountInt = new Function(`return ${amount}`)();
				if (isNaN(amountInt)) return false;
				return (
					amountInt > 0 && source.length > 0 && investment.length > 0
				);
			} catch {
				return false;
			}
		}
	};

	const handlePress = () => {
		realm.write(() => {
			const calculatedAmount = new Function(`return ${amount}`)();
			realm.create(TransactionModel, {
				id: generateUUID(),
				amount: calculatedAmount,
				reason,
				type,
				date: new Date(),
				userId,
				categories,
				trips,
				sourceId: source,
				destinationId: destination,
				investmentId: investment,
			});
			if (type === ExpenseType.EXPENSE) {
				sourceModel.amount -= calculatedAmount;
			} else if (type === ExpenseType.INCOME) {
				sourceModel.amount += calculatedAmount;
			} else if (type === ExpenseType.INVESTMENT) {
				sourceModel.amount -= calculatedAmount;
				investmentModel.investedAmount += calculatedAmount;
			} else if (type === ExpenseType.TRANSFER) {
				sourceModel.amount -= calculatedAmount;
				destinationModel.amount += calculatedAmount;
			}
		});
		setAmount("");
		setReason("");
		setSource("");
		setDestination("");
		setInvestment("");
		setCategories([]);
		setTrips([]);
		navigate(TransactionRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={TransactionRoutes.Main} />
			<CustomText
				text={"Add Transaction"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector transaction />
			<CustomInput
				name={"Amount"}
				value={amount}
				setValue={setAmount}
				numeric
			/>
			<CustomInput name={"Reason"} value={reason} setValue={setReason} />
			<SourceSelector />
			<DestinationSelector />
			<CategorySelector />
			<InvestmentSelector />
			<TripSelector />
			<CustomButton disabled={!isEnabled()} onPress={handlePress} />
		</ScreenLayout>
	);
};

export default TransactionAdd;
