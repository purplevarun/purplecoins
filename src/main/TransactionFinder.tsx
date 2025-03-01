import { useState } from "react";
import CustomInput from "./CustomInput";
import { convertDateToString } from "./HelperFunctions";
import Transaction from "./Transaction";
import { PADDING } from "./constants.config";
import useDatabase from "./useDatabase";

const TransactionFinder = ({
	setTransactions,
}: {
	setTransactions: (_: Transaction[]) => void;
}) => {
	const [searchText, setSearchText] = useState("");
	const { fetchAllTransactions } = useDatabase();
	const onFind = (value: string) => {
		setSearchText(value);
		const rawTransactions = fetchAllTransactions();
		const searchString = value.toLowerCase();
		const filteredTransactions = rawTransactions.filter(
			(transaction) =>
				transaction.reason.toLowerCase().includes(searchString) ||
				transaction.amount.toString().includes(searchString) ||
				convertDateToString(transaction.date).includes(searchString),
		);
		setTransactions(filteredTransactions);
	};
	return (
		<CustomInput
			name={"Search"}
			value={searchText}
			setValue={onFind}
			width={"100%"}
			bottom={PADDING}
			autoFocus
		/>
	);
};

export default TransactionFinder;
