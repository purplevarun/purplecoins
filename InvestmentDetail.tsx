import DataTab from "./DataTab";
import useInvestmentService from "./InvestmentService";
import ScreenLayout from "./ScreenLayout";

const InvestmentDetail = ({ route }: any) => {
	const { investmentId } = route.params;
	const { fetchInvestment } = useInvestmentService();
	const { name, investedAmount, currentAmount } =
		fetchInvestment(investmentId);
	return (
		<ScreenLayout>
			<DataTab name={"Name"} value={name} />
			<DataTab name={"Invested Amount"} value={investedAmount} />
			<DataTab name={"Current Amount"} value={currentAmount} />
		</ScreenLayout>
	);
};

export default InvestmentDetail;
