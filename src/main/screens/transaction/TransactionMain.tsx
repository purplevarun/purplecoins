import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import TransactionFinder from "../../components/finder/TransactionFinder";
import Header from "../../components/header/Header";
import ScreenLayout from "../../components/layout/ScreenLayout";
import CustomText from "../../components/text/CustomText";
import { DISABLED_COLOR } from "../../constants/config/colors.config";
import { CENTER, SCREEN_HEIGHT } from "../../constants/config/constants.config";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";
import Transaction from "../../models/Transaction";
import TransactionRenderItem from "./TransactionRenderItem";

const TransactionMain = () => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const navigate = useScreen();
	const { fetchAllTransactions } = useDatabase();
	const [showFinder, setShowFinder] = useState(false);
	const values = useValues();
	useFocus(() => setTransactions(fetchAllTransactions()), [values.trigger]);
	return (
		<ScreenLayout>
			<Header
				handlePlus={() => navigate(transactionRoutes.add)}
				handleFind={() => setShowFinder((prev) => !prev)}
			/>
			{showFinder && (
				<TransactionFinder setTransactions={setTransactions} />
			)}
			{transactions.length === 0 ? (
				<CustomText
					text={"No Transactions found"}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 4}
					alignSelf={CENTER}
				/>
			) : (
				<FlashList
					data={transactions}
					renderItem={TransactionRenderItem}
					estimatedItemSize={100}
				/>
			)}
		</ScreenLayout>
	);
};

export default TransactionMain;
