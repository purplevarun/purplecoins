import CustomInput from "./CustomInput";
import DropdownSelector from "./DropdownSelector";
import Header from "./Header";
import PaddedRow from "./PaddedRow";
import ScreenLayout from "./ScreenLayout";
import ActionButton from "./src/main/components/buttons/add_screen/ActionButton";
import useCategory from "./src/main/domains/category/useCategory";
import useInvestment from "./src/main/domains/investment/useInvestment";
import useSource from "./src/main/domains/source/useSource";
import useTrip from "./src/main/domains/trip/useTrip";
import useFocus from "./useFocus";
import useTransaction from "./useTransaction";

const TransactionEdit = ({ route }: any) => {
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
		handleEditFocus,
		updateTransaction,
	} = useTransaction(route.params.id);
	const { categoryModels } = useCategory();
	const { tripModels } = useTrip();
	const { investmentModels } = useInvestment();
	const { sourceModels, destinationModels } = useSource();
	useFocus(handleEditFocus);

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
		</ScreenLayout>
	);
};

export default TransactionEdit;
