import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import Header from "./Header";
import IGroupedTransactions from "./IGroupedTransactions";
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

const useFocus = (fn: () => void, params: any[]) => {
	useFocusEffect(useCallback(fn, params));
};

const TransactionMain = () => {
	const { fetchGroupedTransactions } = useTransactionService();
	const [transactions, setTransactions] =
		useState<null | IGroupedTransactions>(null);

	useFocus(() => setTransactions(fetchGroupedTransactions()), []);
	const { navigate } = useNavigation<any>();
	return (
		<ScreenLayout>
			<Header
				title={"Transactions"}
				navigateToAddScreen={() => navigate("Transaction.Add")}
			/>
			{transactions && transactions.length > 0 ? (
				<SectionList
					sections={transactions}
					keyExtractor={KeyExtractor}
					renderSectionHeader={SectionHeader}
					renderItem={RenderItem}
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

const KeyExtractor = (item: ITransaction, index: number) =>
	`${item.id}-${index}`;

const RenderItem = ({ item }: { item: ITransaction }) => (
	<TransactionRenderItem item={item} />
);

const SectionHeader = ({
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
);

const styles = StyleSheet.create({
	header: {
		paddingVertical: PADDING,
		borderRadius: BORDER_RADIUS,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});

export default TransactionMain;
