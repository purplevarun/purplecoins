import { formatMoney } from "../../../../HelperFunctions";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import LinkedTransactions from "../transaction/LinkedTransactions";
import useSource from "./useSource";

const SourceDetail = ({ route }: any) => {
	const {
		fetchOneSource,
		fetchTransactionForSource,
		handleClose,
		handleEdit,
		deleteOneSource,
	} = useSource(route.params.id);
	const { name, amount } = fetchOneSource();
	const transactions = fetchTransactionForSource();
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleEdit={handleEdit}
				canBeDeleted={transactions.length === 0}
				handleDelete={deleteOneSource}
			/>
			<DataTab name={"Name"} value={name} />
			<DataTab name={"Amount"} value={formatMoney(amount)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default SourceDetail;
