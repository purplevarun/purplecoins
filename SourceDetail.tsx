import DataTab from "./DataTab";
import Header from "./Header";
import { formatMoney } from "./HelperFunctions";
import LinkedTransactions from "./LinkedTransactions";
import ScreenLayout from "./ScreenLayout";
import useSourceService from "./SourceService";
import useNavigate from "./useNavigate";

const SourceDetail = ({ route }: any) => {
	const { sourceId } = route.params;
	const { fetchSource, fetchTransactionsForSource, handleDelete } =
		useSourceService();
	const source = fetchSource(sourceId);
	const transactions = fetchTransactionsForSource(sourceId);
	const { navigateToSourceEdit, navigateToSourceMain } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Source Details"}
				handleEdit={() => navigateToSourceEdit(sourceId)}
				handleDelete={() => handleDelete(sourceId)}
				navigateToMainScreen={navigateToSourceMain}
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
