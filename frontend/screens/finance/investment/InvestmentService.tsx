import IInvestment from "../../../interfaces/IInvestment";
import { generateUUID, logger, toInt } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../../auth/AuthService";
import useInvestmentStore from "./InvestmentStore";
import InvestmentRoutes from "./InvestmentRoutes";
import { useNavigation } from "@react-navigation/native";

const useInvestmentService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		currentAmount,
		setCurrentAmount
	} = useInvestmentStore();
	const { navigate } = useNavigation<any>();

	const fetchInvestments = () => {
		try {
			const query = "SELECT * from investment where userId=?";
			const userId = getUserId();
			const investments = db.getAllSync<IInvestment>(query, [userId]);
			logger("fetched investments", investments);
			return investments;
		} catch (e) {
			logger("ERROR: fetching investments", e);
			return [];
		}
	};

	const addNewInvestment = () => {
		try {
			const query = "INSERT INTO investment (id, userId, name, investedAmount, currentAmount) VALUES (?, ?, ?, ?, ?)";
			const id = generateUUID();
			const userId = getUserId();
			db.runSync(query, [id, userId, name, toInt(investedAmount), toInt(currentAmount)]);
		} catch (e) {
			logger("ERROR: creating investment", e);
		}
		clearStore();
		navigate(InvestmentRoutes.Main);
	};

	const clearStore = () => {
		setName("");
		setInvestedAmount("");
		setCurrentAmount("");
	};

	return {
		addNewInvestment,
		fetchInvestments,
		clearStore
	};
};

export default useInvestmentService;