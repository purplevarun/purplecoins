import { FlatList, View } from "react-native";
import CustomText from "./CustomText";
import ITransaction from "./ITransaction";
import TransactionRenderItem from "./TransactionRenderItem";
import Vertical from "./Vertical";
import { DISABLED_COLOR } from "./colors.config";
import { LARGE_FONT_SIZE, PADDING } from "./constants.config";

const LinkedTransactions = ({
	transactions,
}: {
	transactions: ITransaction[];
}) => {
	if (transactions.length > 0)
		return (
			<View style={{ paddingTop: PADDING }}>
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
		<View style={{ paddingTop: PADDING }}>
			<CustomText
				text={"No Linked Transactions"}
				color={DISABLED_COLOR}
				fontSize={LARGE_FONT_SIZE}
			/>
		</View>
	);
};

export default LinkedTransactions;
