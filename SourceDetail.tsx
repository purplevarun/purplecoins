import DataTab from "./DataTab";
import Header from "./Header";
import { formatMoney } from "./HelperFunctions";
import LinkedTransactions from "./LinkedTransactions";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";

const SourceDetail = ({ route }: any) => {
	const sourceId = route.params?.sourceId ?? null;
	if (!sourceId) return null;
	const {
		fetchSource,
		fetchTransactionsForSource,
		handleEdit,
		handleDelete,
	} = useSourceService();
	const source = fetchSource(sourceId);
	const transactions = fetchTransactionsForSource(sourceId);
	return (
		<ScreenLayout>
			<Header
				title={"Source Details"}
				handleEdit={() => handleEdit(sourceId)}
				handleDelete={() => handleDelete(sourceId)}
			/>
			<DataTab name={"Name"} value={source.name} />
			<DataTab
				name={"Initial Amount"}
				value={formatMoney(source.initialAmount)}
			/>
			<DataTab
				name={"Current Amount"}
				value={formatMoney(source.currentAmount)}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default SourceDetail;
