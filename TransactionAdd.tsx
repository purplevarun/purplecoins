import CommonMultiSelector from "./CommonMultiSelector";
import CommonSelector from "./CommonSelector";
import CustomInput from "./CustomInput";
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
					width={isTransfer ? "100%" : "65%"}
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
					width={"65%"}
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
					<CommonSelector
						name={"Source"}
						data={sourceModels}
						value={source}
						setValue={setSource}
						width={"27%"}
					/>
					<CommonMultiSelector
						name={"Categories"}
						data={categoryModels}
						value={categories}
						setValue={setCategories}
						width={"36%"}
					/>
					<CommonMultiSelector
						name={"Trips"}
						data={tripModels}
						value={trips}
						setValue={setTrips}
						width={"32%"}
					/>
				</PaddedRow>
			)}
			{isTransfer && (
				<PaddedRow>
					<CommonSelector
						name={"Source"}
						data={sourceModels}
						value={source}
						setValue={setSource}
						width={"48.5%"}
					/>
					<CommonSelector
						name={"Destination"}
						data={destinationModels}
						value={destination}
						setValue={setDestination}
						width={"48.5%"}
					/>
				</PaddedRow>
			)}
			{isInvestment && (
				<PaddedRow>
					<CommonSelector
						name={"Source"}
						data={sourceModels}
						value={source}
						setValue={setSource}
						width={"48.5%"}
					/>
					<CommonSelector
						name={"Investment"}
						data={investmentModels}
						value={investment}
						setValue={setInvestment}
						width={"48.5%"}
					/>
				</PaddedRow>
			)}
		</ScreenLayout>
	);
};

export default TransactionAdd;
