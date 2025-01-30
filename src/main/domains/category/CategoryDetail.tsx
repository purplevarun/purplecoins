import { categoryRoutes } from "../../app/router/Routes";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";

const CategoryDetail = ({ route }: any) => {
	const id = route.params.id;
	const { navigate } = useScreen();
	const {
		deleteCategory,
		fetchCategory,
		fetchTransactionsForCategory,
		fetchTotalForCategory,
	} = useDatabase();
	const category = fetchCategory(id);
	const transactions = fetchTransactionsForCategory(id);
	const total = fetchTotalForCategory(id);

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(categoryRoutes.main)}
				handleEdit={() => navigate(categoryRoutes.edit, id)}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => deleteCategory(id)}
			/>
			<DataTab name={"Name"} value={category.name} />
			<DataTab
				name={"Amount"}
				value={formatMoney(Math.abs(total))}
				debit={total < 0}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default CategoryDetail;
