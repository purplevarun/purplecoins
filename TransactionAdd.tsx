import CustomInput from "./CustomInput";
import DropdownSelector from "./DropdownSelector";
import Header from "./Header";
import PaddedRow from "./PaddedRow";
import ScreenLayout from "./ScreenLayout";
import TypeSelector from "./TypeSelector";
import ActionButton from "./src/main/components/buttons/add_screen/ActionButton";
import useCategory from "./src/main/domains/category/useCategory";
import useInvestment from "./src/main/domains/investment/useInvestment";
import useSource from "./src/main/domains/source/useSource";
import useTrip from "./src/main/domains/trip/useTrip";
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
		isGeneral,
		isInvestment,
		isTransfer,
	} = useTransaction(route.params.id);
	const { categoryModels } = useCategory();
	const { tripModels } = useTrip();
	const { investmentModels } = useInvestment();
	const { sourceModels, destinationModels } = useSource();

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={addTransaction}
				canBeSubmitted={enabled}
			/>
			<TypeSelector type={type} setType={setType} />
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
				<DropdownSelector
					name={"Source"}
					data={sourceModels}
					single={{ value: source, setValue: setSource }}
				/>
			)}
			{isGeneral && (
				<PaddedRow>
					<DropdownSelector
						name={"Categories"}
						data={categoryModels}
						multi={{ value: categories, setValue: setCategories }}
						width={"49%"}
					/>
					<DropdownSelector
						name={"Trips"}
						data={tripModels}
						multi={{ value: trips, setValue: setTrips }}
						width={"49%"}
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

export default TransactionAdd;
