import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import ITransaction from "../../../../ITransaction";
import { investmentRoutes } from "../../../../Routes";
import useScreen from "../../../../useScreen";
import IInvestment from "./IInvestment";

const useInvestment = (id: string = "") => {
	const { navigate } = useScreen();
	const db = useSQLiteContext();
	const [name, setName] = useState("");
	const [investedAmount, setInvestedAmount] = useState("");
	const [currentAmount, setCurrentAmount] = useState("");
	const [investments, setInvestments] = useState<IInvestment[]>([]);

	const disabled = useMemo(() => {
		return name.length === 0;
	}, [name]);

	const fetchInvestments = () => {
		return db.getAllSync<IInvestment>(select_investments);
	};

	const fetchOneInvestment = () => {
		return db.getFirstSync<IInvestment>(select_one_investment, [
			id,
		]) as IInvestment;
	};

	const iInvestedAmount = useMemo(() => {
		if (investedAmount === "") return 0;
		return parseInt(investedAmount);
	}, [investedAmount]);

	const iCurrentAmount = useMemo(() => {
		if (currentAmount === "") return 0;
		return parseInt(currentAmount);
	}, [currentAmount]);

	const addInvestment = () => {
		db.runSync(insert_investment, [randomUUID(), name, iInvestedAmount]);
		navigate(investmentRoutes.main);
	};

	const handlePlus = () => {
		navigate(investmentRoutes.add);
	};

	const handleClose = () => {
		navigate(investmentRoutes.main);
	};

	const handleDetail = () => {
		navigate(investmentRoutes.detail, id);
	};

	const handleMainFocus = () => {
		setInvestments(fetchInvestments());
	};

	const handleEditFocus = () => {
		const investment = fetchOneInvestment();
		setName(investment.name);
	};

	const handleEdit = () => {
		navigate(investmentRoutes.edit, id);
	};

	const handleDelete = () => {
		db.runSync(delete_investment, [id]);
		navigate(investmentRoutes.main);
	};

	const fetchLinkedTransactions = () => {
		return db.getAllSync<ITransaction>(select_transactions_for_investment, [
			id,
		]);
	};

	const updateOneInvestment = () => {
		db.runSync(update_investment, [name, iCurrentAmount, id]);
		navigate(investmentRoutes.main);
	};

	const investmentModels = fetchInvestments().map((investment) => ({
		label: investment.name,
		value: investment.id,
	}));

	return {
		investmentModels,
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		currentAmount,
		setCurrentAmount,
		investments,
		disabled,
		fetchInvestments,
		fetchOneInvestment,
		addInvestment,
		handleEdit,
		handleDelete,
		handlePlus,
		handleDetail,
		handleClose,
		fetchLinkedTransactions,
		updateOneInvestment,
		handleMainFocus,
		handleEditFocus,
	};
};

const select_investments = `
	SELECT *
	FROM "investment";
`;

const delete_investment = `
	DELETE
	FROM "investment"
	WHERE id=?;
`;

const select_one_investment = `
	SELECT *
	FROM "investment"
	WHERE id = ?;
`;

const insert_investment = `
	INSERT
	INTO "investment" (id, name, investedAmount)
	VALUES (?,?,?);
`;

const select_transactions_for_investment = `
	SELECT *
	FROM "transaction"
	WHERE investmentId = ?;
`;

const update_investment = `
	UPDATE "investment"
	SET name = ?, currentAmount = ?
	WHERE id = ?;
`;

export default useInvestment;
