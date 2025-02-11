import { investmentRoutes } from "../../app/router/Routes";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { calculateTotal, formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";

const InvestmentDetail = ({ route }: any) => {
	const id = route.params.id;
	const navigate = useScreen();
	const { fetchRelation, deleteRelation, fetchTransactionsForRelation } =
		useDatabase();
	const relation = fetchRelation(id);
	const transactions = fetchTransactionsForRelation(id);
	const total = calculateTotal(transactions);
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleEdit={() => navigate(investmentRoutes.edit, { id })}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => {
					deleteRelation(id);
					navigate(investmentRoutes.main);
				}}
			/>
			<DataTab name={"Name"} value={relation.name} />
			<DataTab
				name={"Amount"}
				value={formatMoney(Math.abs(total))}
				debit={total < 0}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};
export default InvestmentDetail;
