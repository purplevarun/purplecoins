import { useState } from "react";
import { PADDING } from "../constants/constants.config";
import useDatabase from "../hooks/useDatabase";
import Transaction from "../models/Transaction";
import { convertDateToString } from "../util/HelperFunctions";
import CustomInput from "./CustomInput";

const Finder = ({
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
		/>
	);
};

export default Finder;
