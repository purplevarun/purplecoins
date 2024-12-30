import Routes from "./Routes";
import TransactionMain from "./TransactionMain";
import TransactionAdd from "./TransactionAdd";
import TransactionDetail from "./TransactionDetail";
import CategoryMain from "./CategoryMain";
import CategoryAdd from "./CategoryAdd";
import CategoryDetail from "./CategoryDetail";
import TripMain from "./TripMain";
import TripAdd from "./TripAdd";
import TripDetail from "./TripDetail";
import SourceMain from "./SourceMain";
import SourceAdd from "./SourceAdd";
import SourceDetail from "./SourceDetail";
import InvestmentMain from "./InvestmentMain";
import InvestmentAdd from "./InvestmentAdd";
import AnalysisMain from "./AnalysisMain";
import SyncScreen from "./SyncScreen";

const RouteMap = {
	[Routes.Transaction.Main]: TransactionMain,
	[Routes.Transaction.Add]: TransactionAdd,
	[Routes.Transaction.Detail]: TransactionDetail,
	[Routes.Category.Main]: CategoryMain,
	[Routes.Category.Add]: CategoryAdd,
	[Routes.Category.Detail]: CategoryDetail,
	[Routes.Trip.Main]: TripMain,
	[Routes.Trip.Add]: TripAdd,
	[Routes.Trip.Detail]: TripDetail,
	[Routes.Source.Main]: SourceMain,
	[Routes.Source.Add]: SourceAdd,
	[Routes.Source.Detail]: SourceDetail,
	[Routes.Investment.Main]: InvestmentMain,
	[Routes.Investment.Add]: InvestmentAdd,
	[Routes.Investment.Detail]: InvestmentMain,
	[Routes.Analysis]: AnalysisMain,
	[Routes.Sync]: SyncScreen,
};

export default RouteMap;
