import TransactionRouter from "../transaction/TransactionRouter";
import CategoryRouter from "../category/CategoryRouter";
import TripRouter from "../trip/TripRouter";
import SourceRouter from "../source/SourceRouter";
import InvestmentScreen from "../investment/InvestmentScreen";

const FinanceRoutes = {
	Transactions: { page: TransactionRouter },
	Categories: { page: CategoryRouter },
	Investments: { page: InvestmentScreen },
	Sources: { page: SourceRouter },
	Trips: { page: TripRouter },
};

export default FinanceRoutes;
