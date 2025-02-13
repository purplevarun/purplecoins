import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import CustomText from "../../components/CustomText";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import TransactionFinder from "../../components/TransactionFinder";
import { DISABLED_COLOR } from "../../constants/colors.config";
import { CENTER, SCREEN_HEIGHT } from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Transaction from "../../models/Transaction";
import TransactionRenderItem from "./TransactionRenderItem";

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
