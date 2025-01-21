import CustomInput from "../../components/CustomInput";
import DropdownSelector from "../../components/DropdownSelector";
import Header from "../../components/Header";
import PaddedRow from "../../components/PaddedRow";
import ScreenLayout from "../../components/ScreenLayout";
import ActionButton from "../../components/buttons/add_screen/ActionButton";
import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";
import useFocus from "../../hooks/useFocus";
import useCategory from "../category/useCategory";
import useInvestment from "../investment/useInvestment";
import useSource from "../source/useSource";
import useTrip from "../trip/useTrip";
import useTransaction from "./useTransaction";

const TransactionEdit = ({ route }: any) => {
	const {
		amount,
		reason,
		date,
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
		setSource,
		setAction,
		setInvestment,
		setTrips,
		setCategories,
		setDestination,
		handleClose,
		handleEditFocus,
		updateTransaction,
		fetchTransaction,
	} = useTransaction(route.params.id);

	const { categoryModels } = useCategory();
	const { tripModels } = useTrip();
	const { investmentModels } = useInvestment();
	const { sourceModels } = useSource();
	const { destinationModels } = useSource(source);
	useFocus(handleEditFocus);

	const { type } = fetchTransaction();
	const isTransfer = type === Type.TRANSFER;
	const isGeneral = type === Type.GENERAL;
	const isInvestment = type === Type.INVESTMENT;

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={updateTransaction}
				canBeSubmitted={enabled}
			/>
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
							action === Action.DEBIT ? "Source" : "Destination"
						}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"32%"}
					/>
					<DropdownSelector
						name={"Categories"}
						data={categoryModels}
						multi={{ value: categories, setValue: setCategories }}
						width={"32%"}
					/>
					<DropdownSelector
						name={"Trips"}
						data={tripModels}
						multi={{ value: trips, setValue: setTrips }}
						width={"32%"}
					/>
				</PaddedRow>
			)}
			{isTransfer && (
				<PaddedRow>
					<DropdownSelector
						name={"Source"}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"49%"}
					/>
					<DropdownSelector
						name={"Destination"}
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
						name={"Source"}
						data={sourceModels}
						single={{ value: source, setValue: setSource }}
						width={"49%"}
					/>
					<DropdownSelector
						name={"Investment"}
						data={investmentModels}
						single={{ value: investment, setValue: setInvestment }}
						width={"49%"}
					/>
				</PaddedRow>
			)}
		</ScreenLayout>
	);
};

export default TransactionEdit;
