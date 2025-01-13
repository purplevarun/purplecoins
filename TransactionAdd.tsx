import { DimensionValue, TouchableOpacity, View } from "react-native";
import Action from "./Action";
import CategorySelector from "./CategorySelector";
import CustomInput from "./CustomInput";
import CustomText from "./CustomText";
import DestinationSelector from "./DestinationSelector";
import Header from "./Header";
import InvestmentSelector from "./InvestmentSelector";
import ScreenLayout from "./ScreenLayout";
import SourceSelector from "./SourceSelector";
import TransactionType from "./TransactionType";
import TripSelector from "./TripSelector";
import TypeSelector from "./TypeSelector";
import { GREEN_COLOR, PRIMARY_COLOR, RED_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	NINETY_P,
	SPACE_BETWEEN,
} from "./constants.config";
import useTransaction from "./useTransaction";

const TransactionAdd = ({ route }: any) => {
	const {
		amount,
		reason,
		date,
		type,
		source,
		action,
		destination,
		trips,
		categories,
		investment,
		disabled,
		setAmount,
		setReason,
		setDate,
		setType,
		setSource,
		setAction,
		setInvestment,
		setTrips,
		setCategories,
		setDestination,
		addTransaction,
		handleClose,
	} = useTransaction(route.params.id);

	const isGeneral = type === TransactionType.GENERAL;
	const isInvestment = type === TransactionType.INVESTMENT;
	const isTransfer = type === TransactionType.TRANSFER;

	return (
		<ScreenLayout>
			<Header handleClose={handleClose} handleSubmit={addTransaction} />
			<TypeSelector type={type} setType={setType} />
			<View
				style={{
					flexDirection: FLEX_ROW,
					width: NINETY_P,
					alignSelf: CENTER,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomInput
					name={"Amount"}
					value={amount}
					setValue={setAmount}
					width={"65%"}
					numeric
				/>
				<ActionButton
					action={action}
					setAction={setAction}
					width={"32%"}
				/>
			</View>
			<View
				style={{
					flexDirection: FLEX_ROW,
					width: NINETY_P,
					alignSelf: CENTER,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomInput
					name={"Reason"}
					value={reason}
					setValue={setReason}
					width={"65%"}
				/>
				<CustomInput
					name={"Date"}
					value={date}
					setValue={setDate}
					width={"32%"}
				/>
			</View>
			{isGeneral && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						width: NINETY_P,
						alignSelf: CENTER,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<View
						style={{
							flexDirection: FLEX_ROW,
							width: "65%",
							alignSelf: CENTER,
							justifyContent: SPACE_BETWEEN,
						}}
					>
						<SourceSelector
							source={source}
							setSource={setSource}
							width={"48%"}
						/>
						<CategorySelector
							categories={categories}
							setCategories={setCategories}
							width={"48%"}
						/>
					</View>
					<TripSelector
						trips={trips}
						setTrips={setTrips}
						width={"32%"}
					/>
				</View>
			)}
			{isTransfer && (
				<DestinationSelector
					source={source}
					destination={destination}
					setDestination={setDestination}
				/>
			)}
			{isInvestment && (
				<InvestmentSelector
					investment={investment}
					setInvestment={setInvestment}
				/>
			)}
		</ScreenLayout>
	);
};

const ActionButton = ({
	action,
	setAction,
	width,
}: {
	action: Action;
	setAction: (val: Action) => void;
	width: DimensionValue;
}) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor:
					action === Action.DEBIT ? RED_COLOR : GREEN_COLOR,
				width,
				borderRadius: BORDER_RADIUS,
				height: FONT_SIZE * 2.5,
				alignSelf: "flex-end",
				justifyContent: CENTER,
				borderWidth: 2,
				borderColor: PRIMARY_COLOR,
			}}
			onPress={() =>
				setAction(
					action === Action.DEBIT ? Action.CREDIT : Action.DEBIT,
				)
			}
		>
			<CustomText text={action} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default TransactionAdd;
