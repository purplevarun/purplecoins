import { useState } from "react";
import DataTab from "./DataTab";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import RelationType from "./RelationType";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";
import Transaction from "./Transaction";
import { calculateTotal, formatMoney } from "./HelperFunctions";
import LinkedTransactions from "./LinkedTransactions";
import relationMap from "./RelationMap";

const RelationDetailScreen = ({ route }: any) => {
	const id = route.params.id;
	const relationType = route.params.relation as RelationType;
	const navigate = useScreen();
	const { fetchRelation, deleteRelation, fetchTransactionsForRelation } =
		useDatabase();
	const relation = fetchRelation(id);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	useFocus(() => {
		setTransactions(fetchTransactionsForRelation(id));
	});
	const total = calculateTotal(transactions);
	const routes = relationMap[relationType].routes;
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(routes.main)}
				handleEdit={() => navigate(routes.edit, { id })}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => {
					deleteRelation(id);
					navigate(routes.main);
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

export default RelationDetailScreen;
