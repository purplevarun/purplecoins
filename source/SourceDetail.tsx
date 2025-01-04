import DataTab from "../DataTab";
import Header from "../Header";
import { formatMoney } from "../HelperFunctions";
import LinkedTransactions from "../LinkedTransactions";
import ScreenLayout from "../ScreenLayout";
import useSource from "./useSource";

const SourceDetail = ({ route }: any) => {
	const { id } = route.params;
	const {
		fetchOneSource,
		fetchTransactionForSource,
		handleClose,
		handleEdit,
		deleteOneSource,
	} = useSource();
	const { name, amount } = fetchOneSource(id);
	const transactions = fetchTransactionForSource(id);
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleEdit={() => handleEdit(id)}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => deleteOneSource(id)}
			/>
			<DataTab name={"Name"} value={name} />
			<DataTab name={"Amount"} value={formatMoney(amount)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default SourceDetail;
