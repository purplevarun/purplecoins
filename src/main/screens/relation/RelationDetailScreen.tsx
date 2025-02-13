import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { calculateTotal, formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";
import relationMap from "./RelationMap";

const RelationDetailScreen = ({ route }: any) => {
	const id = route.params.id;
	const relationType = route.params.relation as RelationType;
	const navigate = useScreen();
	const { fetchRelation, deleteRelation, fetchTransactionsForRelation } =
		useDatabase();
	const relation = fetchRelation(id);
	const transactions = fetchTransactionsForRelation(id);
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
