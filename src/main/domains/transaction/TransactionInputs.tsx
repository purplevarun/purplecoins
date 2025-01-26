import CustomInput from "../../components/CustomInput";
import DropdownSelector from "../../components/DropdownSelector";
import DropdownType from "../../components/DropdownType";
import PaddedRow from "../../components/PaddedRow";
import ActionButton from "../../components/buttons/add_screen/ActionButton";
import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";
import useDatabase from "../../hooks/useDatabase";
import useValues from "../../hooks/useValues";
import ICategory from "../category/ICategory";
import IInvestment from "../investment/IInvestment";
import ISource from "../source/ISource";
import ITrip from "../trip/ITrip";

const TransactionInputs = () => {
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
		setAmount,
		setReason,
		setDate,
		setSource,
		setAction,
		setInvestment,
		setTrips,
		setCategories,
		setDestination,
	} = useValues();
	const {
		fetchAllSources,
		fetchAllInvestments,
		fetchAllTrips,
		fetchAllCategories,
	} = useDatabase();
	const sourceList = fetchAllSources();
	const categoryList = fetchAllCategories();
	const tripList = fetchAllTrips();
	const investmentList = fetchAllInvestments();

	const callback = (s: ISource | ITrip | ICategory | IInvestment) => ({
		label: s.name,
		value: s.id,
	});

	const sourceModels = sourceList.map(callback);
	const destinationModels = sourceList
		.filter((destination) => destination.id !== source)
		.map(callback);
	const categoryModels = categoryList.map(callback);
	const tripModels = tripList.map(callback);
	const investmentModels = investmentList.map(callback);

	const isGeneral = type === Type.GENERAL;
	const isInvestment = type === Type.INVESTMENT;
	const isTransfer = type === Type.TRANSFER;

	return (
		<>
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
					width={"61%"}
				/>
				<CustomInput
					name={"Date"}
					value={date}
					setValue={setDate}
					width={"37%"}
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
						width={"35%"}
					/>
					<DropdownSelector
						name={DropdownType.CATEGORY}
						data={categoryModels}
						multi={{
							value: categories,
							setValue: setCategories,
						}}
						width={"35%"}
					/>
					<DropdownSelector
						name={DropdownType.TRIP}
						data={tripModels}
						multi={{ value: trips, setValue: setTrips }}
						width={"26%"}
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
		</>
	);
};

export default TransactionInputs;
