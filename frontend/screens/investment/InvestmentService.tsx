import { useNavigation } from "@react-navigation/native";
import {
	fetch_all_investments,
	insert_investment,
	select_all_users,
} from "../../config/queries.config";
import { generateUUID, toInt } from "../../HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import IInvestment from "../../interfaces/IInvestment";
import useInvestmentStore from "./InvestmentStore";
import IUser from "../../interfaces/IUser";
import Routes from "../../Routes";
import { useMemo } from "react";
import useTransactionStore from "../transaction/TransactionStore";
import TransactionType from "../../components/TransactionType";

const useInvestmentService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		currentAmount,
		setCurrentAmount,
	} = useInvestmentStore();
	const { investmentId, setInvestmentId, type } = useTransactionStore();

	const { navigate } = useNavigation<any>();

	const fetchInvestments = () => {
		try {
			const investments = db.getAllSync<IInvestment>(
				fetch_all_investments,
				[userId],
			);
			console.log("fetched investments", investments);
			return investments;
		} catch (e) {
			console.log("ERROR: fetching investments", e);
			return [];
		}
	};

	const addNewInvestment = () => {
		try {
			const id = generateUUID();
			db.runSync(insert_investment, [
				id,
				userId,
				name,
				toInt(investedAmount),
				toInt(currentAmount),
			]);
		} catch (e) {
			console.log("ERROR: creating investment", e);
		}
		clearStore();
		navigate(Routes.Investment.Main);
	};

	const clearStore = () => {
		setName("");
		setInvestedAmount("");
		setCurrentAmount("");
	};

	const investmentDropdownData = useMemo(() => {
		const investmentModels = fetchInvestments().map((investment) => ({
			label: investment.name,
			value: investment.id,
		}));
		return {
			placeholder: "Select Investment",
			data: investmentModels,
			selectedValue: investmentId,
			onChange: setInvestmentId,
			typeCheck: type === TransactionType.INVESTMENT,
		};
	}, [name]);

	return {
		addNewInvestment,
		fetchInvestments,
		clearStore,
		investmentDropdownData,
	};
};

export default useInvestmentService;
