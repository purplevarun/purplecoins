import { formatMoney } from "./HelperFunctions";
import DataTab from "./DataTab";
import LinkedTransactions from "./LinkedTransactions";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";

const SourceDetail = ({ route }: any) => {
	const sourceId = route.params?.sourceId ?? null;
	const { fetchSource, fetchTransactionsForSource } = useSourceService();
	const source = fetchSource(sourceId);
	const transactions = fetchTransactionsForSource(sourceId);
	return (
		<ScreenLayout>
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
