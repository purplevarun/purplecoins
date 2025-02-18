import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import CustomText from "./CustomText";
import Header from "./Header";
import { transactionRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import Transaction from "./Transaction";
import TransactionFinder from "./TransactionFinder";
import TransactionRenderItem from "./TransactionRenderItem";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";

const TransactionMain = () => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const navigate = useScreen();
	const { fetchAllTransactions } = useDatabase();
	const [showFinder, setShowFinder] = useState(false);
	useFocus(() => setTransactions(fetchAllTransactions()));

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
