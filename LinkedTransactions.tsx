import ITransaction from "./ITransaction";
import { FlatList, StyleSheet, View } from "react-native";
import { LARGE_FONT_SIZE, PADDING } from "./constants.config";
import CustomText from "./CustomText";
import Vertical from "./Vertical";
import TransactionRenderItem from "./TransactionRenderItem";
import { DISABLED_COLOR } from "./colors.config";

const LinkedTransactions = ({
	transactions,
}: {
	transactions: ITransaction[];
}) => {
	if (transactions && transactions.length > 0)
		return (
			<View style={styles.view}>
				<CustomText
					text={"Linked Transactions"}
					fontSize={LARGE_FONT_SIZE}
				/>
				<Vertical />
				<FlatList
					data={transactions}
					renderItem={({ item }) => (
						<TransactionRenderItem item={item} />
					)}
				/>
			</View>
		);
	return (
		<View style={styles.view}>
			<CustomText
				text={"No Linked Transactions"}
				color={DISABLED_COLOR}
				fontSize={LARGE_FONT_SIZE}
			/>
		</View>
	);
};

const styles = StyleSheet.create({ view: { paddingTop: PADDING } });

export default LinkedTransactions;
