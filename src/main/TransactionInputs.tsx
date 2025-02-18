import { useState } from "react";
import ActionButton from "./ActionButton";
import CustomInput from "./CustomInput";
import DropdownSelector from "./DropdownSelector";
import DropdownType from "./DropdownType";
import IRenderItem from "./IRenderItem";
import PaddedRow from "./PaddedRow";
import Relation from "./Relation";
import RelationType from "./RelationType";
import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useValues from "./useValues";

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
	const { fetchAllRelations } = useDatabase();
	const callback = (s: Relation): IRenderItem => ({
		label: s.name,
		value: s.id,
	});

	const [sourceModels, setSourceModels] = useState<IRenderItem[]>([]);
	const [destinationModels, setDestinationModels] = useState<IRenderItem[]>(
		[],
	);
	const [categoryModels, setCategoryModels] = useState<IRenderItem[]>([]);
	const [tripModels, setTripModels] = useState<IRenderItem[]>([]);
	const [investmentModels, setInvestmentModels] = useState<IRenderItem[]>([]);

	useFocus(() => {
		setSourceModels(fetchAllRelations(RelationType.SOURCE).map(callback));
		setDestinationModels(
			fetchAllRelations(RelationType.SOURCE)
				.filter((destination) => destination.id !== source)
				.map(callback),
		);
		setCategoryModels(
			fetchAllRelations(RelationType.CATEGORY).map(callback),
		);
		setTripModels(fetchAllRelations(RelationType.TRIP).map(callback));
		setInvestmentModels(
			fetchAllRelations(RelationType.INVESTMENT).map(callback),
		);
	});

	const isGeneral = type === TransactionType.GENERAL;
	const isInvestment = type === TransactionType.INVESTMENT;
	const isTransfer = type === TransactionType.TRANSFER;

	return (
		<>
			<PaddedRow>
				<CustomInput
					name={"Amount"}
					value={amount}
					setValue={setAmount}
					width={isTransfer ? "100%" : "66%"}
					numeric
					autoFocus
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
							action === TransactionAction.DEBIT
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
