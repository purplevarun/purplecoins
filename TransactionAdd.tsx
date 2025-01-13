import CommonMultiSelector from "./CommonMultiSelector";
import CustomInput from "./CustomInput";
import DestinationSelector from "./DestinationSelector";
import Header from "./Header";
import InvestmentSelector from "./InvestmentSelector";
import PaddedRow from "./PaddedRow";
import ScreenLayout from "./ScreenLayout";
import SourceSelector from "./SourceSelector";
import TypeSelector from "./TypeSelector";
import ActionButton from "./src/main/components/buttons/add_screen/ActionButton";
import useCategory from "./src/main/domains/category/useCategory";
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
					width={"65%"}
					numeric
				/>
				<ActionButton
					action={action}
					setAction={setAction}
					width={"32%"}
				/>
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
					<SourceSelector
						source={source}
						setSource={setSource}
						width={"27%"}
					/>
					<CommonMultiSelector
						name={"Categories"}
						data={categoryModels}
						value={categories}
						onChange={setCategories}
						width={"36%"}
					/>
					<CommonMultiSelector
						name={"Trips"}
						data={tripModels}
						value={trips}
						onChange={setTrips}
						width={"32%"}
					/>
				</PaddedRow>
			)}
			{isTransfer && (
				<PaddedRow>
					<SourceSelector
						source={source}
						setSource={setSource}
						width={"48.5%"}
					/>
					<DestinationSelector
						source={source}
						destination={destination}
						setDestination={setDestination}
						width={"48.5%"}
					/>
				</PaddedRow>
			)}
			{isInvestment && (
				<PaddedRow>
					<SourceSelector
						source={source}
						setSource={setSource}
						width={"48.5%"}
					/>
					<InvestmentSelector
						investment={investment}
						setInvestment={setInvestment}
						width={"48.5%"}
					/>
				</PaddedRow>
			)}
		</ScreenLayout>
	);
};

export default TransactionAdd;
