import { sourceRoutes } from "../../app/router/Routes";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";

const SourceDetail = ({ route }: { route: any }) => {
	const id = route.params.id;
	const { navigate } = useScreen();
	const {
		fetchTransactionsForSource,
		deleteSource,
		fetchSource,
		fetchTotalForSource,
	} = useDatabase();
	const source = fetchSource(id);
	const transactions = fetchTransactionsForSource(id);
	const total = fetchTotalForSource(id);

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(sourceRoutes.main)}
				handleEdit={() => navigate(sourceRoutes.edit, id)}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => deleteSource(id)}
			/>
			<DataTab name={"Name"} value={source.name} />
			<DataTab name={"Amount"} value={formatMoney(total)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default SourceDetail;
