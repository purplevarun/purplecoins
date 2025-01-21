import CustomInput from "../../components/CustomInput";
import DropdownSelector from "../../components/DropdownSelector";
import DropdownType from "../../components/DropdownType";
import Header from "../../components/Header";
import PaddedRow from "../../components/PaddedRow";
import ScreenLayout from "../../components/ScreenLayout";
import ActionButton from "../../components/buttons/add_screen/ActionButton";
import Action from "../../constants/enums/Action";
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
			{isGeneral && (
				<PaddedRow>
					<DropdownSelector
						name={
							action === Action.DEBIT
								? DropdownType.SOURCE
								: DropdownType.DESTINATION
						}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"30%"}
					/>
					<DropdownSelector
						name={DropdownType.CATEGORY}
						data={categoryModels}
						multi={{
							value: categories,
							setValue: setCategories,
						}}
						width={"34%"}
					/>
					<DropdownSelector
						name={DropdownType.TRIP}
						data={tripModels}
						multi={{ value: trips, setValue: setTrips }}
						width={"32%"}
					/>
				</PaddedRow>
			)}
			{isTransfer && (
				<PaddedRow>
					<DropdownSelector
						name={DropdownType.SOURCE}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"49%"}
					/>
					<DropdownSelector
						name={DropdownType.DESTINATION}
						data={destinationModels}
						single={{
							value: destination,
							setValue: setDestination,
						}}
						width={"49%"}
					/>
				</PaddedRow>
			)}
			{isInvestment && (
				<PaddedRow>
					<DropdownSelector
						name={DropdownType.SOURCE}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"49%"}
					/>
					<DropdownSelector
						name={DropdownType.INVESTMENT}
						data={investmentModels}
						single={{ value: investment, setValue: setInvestment }}
						width={"49%"}
					/>
				</PaddedRow>
			)}
		</ScreenLayout>
	);
};

export default TransactionAdd;
