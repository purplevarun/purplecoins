import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import LinkedTransactions from "../transaction/LinkedTransactions";
import useCategory from "./useCategory";

const CategoryDetail = ({ route }: any) => {
	const {
		fetchOneCategory,
		fetchTransactionsForCategory,
		handleClose,
		handleEdit,
		deleteOneCategory,
	} = useCategory(route.params.id);
	const category = fetchOneCategory();
	const transactions = fetchTransactionsForCategory();
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleEdit={handleEdit}
				canBeDeleted={transactions.length === 0}
				handleDelete={deleteOneCategory}
			/>
			<DataTab name={"Name"} value={category.name} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default CategoryDetail;
