import TransactionRouter from "../transaction/TransactionRouter";
import AnalysisScreen from "../analysis/AnalysisScreen";
import CategoryRouter from "../category/CategoryRouter";
import TripMain from "../trip/TripMain";

const FinanceRoutes = {
	Transactions: { page: TransactionRouter },
	Analysis: { page: AnalysisScreen },
	Categories: { page: CategoryRouter },
	Trips: { page: TripMain },
};

export default FinanceRoutes;
