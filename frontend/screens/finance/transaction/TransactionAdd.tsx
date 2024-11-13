import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
	NINETY_P,
	PADDING,
} from "../../../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import { formatDate, generateUUID } from "../../../util/HelperFunctions";
import { useRealm } from "@realm/react";
import TransactionRoutes from "./TransactionRoutes";
import useTransactionStore from "./TransactionStore";
import TransactionModel from "../../../models/TransactionModel";
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
import useDatabase from "../../../util/DatabaseFunctions";
import ExpenseType from "../../../types/ExpenseType";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const TransactionAdd = () => {
	const realm = useRealm();
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
		setDate,
		date,
	} = useTransactionStore();

	const { user, sources, investments } = useDatabase();

	const isEnabled = () => {
		const amountInt = parseInt(amount);
		if (type === ExpenseType.EXPENSE || type === ExpenseType.INCOME) {
			try {
				if (isNaN(amountInt)) return false;
				return amountInt > 0 && reason.length > 0 && source.length > 0;
			} catch {
				return false;
			}
		}
		if (type === ExpenseType.TRANSFER) {
			try {
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
			const calculatedAmount = parseInt(amount);
			realm.create(TransactionModel, {
				id: generateUUID(),
				amount: calculatedAmount,
				reason,
				type,
				date,
				userId: user.id,
				categories,
				trips,
				sourceId: source,
				destinationId: destination,
				investmentId: investment,
			});
			const sourceModel = sources.find((s) => s.id === source);
			const destinationModel = sources.find((d) => d.id === destination);
			const investmentModel = investments.find(
				(i) => i.id === investment,
			);
			if (type === ExpenseType.EXPENSE && sourceModel) {
				sourceModel.amount -= calculatedAmount;
			} else if (type === ExpenseType.INCOME && sourceModel) {
				sourceModel.amount += calculatedAmount;
			} else if (
				type === ExpenseType.INVESTMENT &&
				sourceModel &&
				investmentModel
			) {
				sourceModel.amount -= calculatedAmount;
				investmentModel.investedAmount += calculatedAmount;
			} else if (
				type === ExpenseType.TRANSFER &&
				sourceModel &&
				destinationModel
			) {
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
		setDate(new Date());
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
				required
			/>
			<CustomInput
				name={"Reason"}
				value={reason}
				setValue={setReason}
				required
			/>
			<SourceSelector />
			<TransactionDatePicker />
			<DestinationSelector />
			<CategorySelector />
			<InvestmentSelector />
			<TripSelector />
			<CustomButton disabled={!isEnabled()} onPress={handlePress} />
		</ScreenLayout>
	);
};

const TransactionDatePicker = () => {
	const { date, setDate } = useTransactionStore();
	const [showPicker, setShowPicker] = useState(false);
	if (showPicker)
		return (
			<RNDateTimePicker
				value={date}
				onChange={(_, newDate) => {
					setShowPicker(false);
					setDate(newDate ?? new Date());
				}}
			/>
		);
	return (
		<TouchableOpacity
			style={{
				borderWidth: BORDER_WIDTH,
				borderColor: PRIMARY_COLOR,
				borderRadius: BORDER_RADIUS,
				width: NINETY_P,
				alignSelf: CENTER,
				padding: PADDING,
				marginTop: MARGIN * 2,
			}}
			onPress={() => {
				setShowPicker(true);
			}}
		>
			<CustomText text={formatDate(date)} />
		</TouchableOpacity>
	);
};

export default TransactionAdd;
