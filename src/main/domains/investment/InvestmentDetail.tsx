import { investmentRoutes } from "../../app/router/Routes";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";

const InvestmentDetail = ({ route }: { route: any }) => {
	const id = route.params.id;
	const { navigate } = useScreen();
	const {
		fetchInvestment,
		deleteInvestment,
		fetchTransactionsForInvestment,
		fetchTotalForInvestment,
	} = useDatabase();
	const investment = fetchInvestment(id);
	const transactions = fetchTransactionsForInvestment(id);
	const total = fetchTotalForInvestment(id);

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleEdit={() => navigate(investmentRoutes.edit, id)}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => deleteInvestment(id)}
			/>
			<DataTab name={"Name"} value={investment.name} />
			<DataTab name={"Amount"} value={formatMoney(total)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};
export default InvestmentDetail;
