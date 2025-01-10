import DataTab from "../../../DataTab";
import Header from "../../../Header";
import { formatMoney } from "../../../HelperFunctions";
import LinkedTransactions from "../../../LinkedTransactions";
import ScreenLayout from "../../../ScreenLayout";
import useInvestment from "./useInvestment";

const InvestmentDetail = ({ route }: any) => {
	const {
		fetchOneInvestment,
		handleClose,
		handleEdit,
		handleDelete,
		fetchLinkedTransactions,
	} = useInvestment(route.params.id);
	const { name, investedAmount, currentAmount } = fetchOneInvestment();
	const transactions = fetchLinkedTransactions();
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleEdit={handleEdit}
				handleDelete={handleDelete}
				canBeDeleted={investedAmount === 0}
			/>
			<DataTab name={"Name"} value={name} />
			<DataTab
				name={"Invested Amount"}
				value={formatMoney(investedAmount)}
			/>
			<DataTab
				name={"Current Amount"}
				value={formatMoney(currentAmount)}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default InvestmentDetail;
