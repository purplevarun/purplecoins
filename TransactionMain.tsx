import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import Header from "./Header";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import ScreenLayout from "./ScreenLayout";
import TransactionRenderItem from "./TransactionRenderItem";
import useTransactionService from "./TransactionService";
import { DISABLED_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	PADDING,
	SCREEN_HEIGHT,
	SPACE_BETWEEN,
} from "./constants.config";
import useFocus from "./useFocus";

const TransactionMain = () => {
	const { fetchGroupedTransactions } = useTransactionService();
	const [transactions, setTransactions] = useState<IGroupedTransaction[]>([]);
	useFocus(() => setTransactions(fetchGroupedTransactions()), []);
	const { navigate } = useNavigation<any>();
	return (
		<ScreenLayout>
			<Header
				title={"Transactions"}
				navigateToAddScreen={() => navigate("Transaction.Add")}
			/>
			{transactions.length > 0 ? (
				<SectionList
					sections={transactions}
					keyExtractor={(item: ITransaction, index: number) =>
						`${item.id}-${index}`
					}
					renderSectionHeader={({
						section: { title },
					}: {
						section: { title: string };
					}) => (
						<View style={styles.header}>
							<CustomText
								text={title}
								fontSize={LARGE_FONT_SIZE}
								alignSelf={CENTER}
							/>
						</View>
					)}
					renderItem={({ item }: { item: ITransaction }) => (
						<TransactionRenderItem item={item} />
					)}
				/>
			) : (
				<CustomText
					text={"No Transactions found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
		</ScreenLayout>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingVertical: PADDING,
		borderRadius: BORDER_RADIUS,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});

export default TransactionMain;
