import CustomInput from "../../components/CustomInput";
import DropdownSelector from "../../components/DropdownSelector";
import Header from "../../components/Header";
import PaddedRow from "../../components/PaddedRow";
import ScreenLayout from "../../components/ScreenLayout";
import ActionButton from "../../components/buttons/add_screen/ActionButton";
import Type from "../../constants/enums/Type";
import useCategory from "../category/useCategory";
import useInvestment from "../investment/useInvestment";
import useSource from "../source/useSource";
import useTrip from "../trip/useTrip";
import TransactionTypeSelector from "./TransactionTypeSelector";
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
		enabled,
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

	const { categoryModels } = useCategory();
	const { tripModels } = useTrip();
	const { investmentModels } = useInvestment();
	const { sourceModels } = useSource();
	const { destinationModels } = useSource(source);

	const isGeneral = type === Type.GENERAL;
	const isInvestment = type === Type.INVESTMENT;
	const isTransfer = type === Type.TRANSFER;

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={addTransaction}
				canBeSubmitted={enabled}
			/>
			<TransactionTypeSelector type={type} setType={setType} />
			<PaddedRow>
				<CustomInput
					name={"Amount"}
					value={amount}
					setValue={setAmount}
					width={isTransfer ? "100%" : "66%"}
					numeric
				/>
				{!isTransfer && (
					<ActionButton
						action={action}
						setAction={setAction}
						width={"32%"}
					/>
				)}
			</PaddedRow>
			<PaddedRow>
				<CustomInput
					name={"Reason"}
					value={reason}
					setValue={setReason}
					width={"66%"}
				/>
				<CustomInput
					name={"Date"}
					value={date}
					setValue={setDate}
					width={"32%"}
				/>
			</PaddedRow>
			<DropdownSelector
				name={"Source"}
				data={sourceModels}
				single={{ value: source, setValue: setSource }}
			/>
			{isGeneral && (
				<DropdownSelector
					name={"Categories"}
					data={categoryModels}
					multi={{ value: categories, setValue: setCategories }}
				/>
			)}
			{isGeneral && (
				<DropdownSelector
					name={"Trips"}
					data={tripModels}
					multi={{ value: trips, setValue: setTrips }}
				/>
			)}
			{isTransfer && (
				<DropdownSelector
					name={"Destination"}
					data={destinationModels}
					single={{
						value: destination,
						setValue: setDestination,
					}}
				/>
			)}
			{isInvestment && (
				<DropdownSelector
					name={"Investment"}
					data={investmentModels}
					single={{ value: investment, setValue: setInvestment }}
				/>
			)}
		</ScreenLayout>
	);
};

export default TransactionAdd;
