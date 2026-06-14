import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { GlassCard } from "@/components/GlassCard";
import { COLORS } from "@/constants/colors";
import { getTransactionDisplayReason } from "@/services/transactionService";
import type { Transaction } from "@/types/Transaction";
import { formatDate } from "@/utils/date";
import { formatMoney } from "@/utils/money";

type TransactionCardProps = Readonly<{
	transaction: Transaction;
	onPress: () => void;
	onLongPress?: () => void;
}>;

const getTransactionColor = (transaction: Transaction): string => {
	if (transaction.type === "CREDIT") {
		return COLORS.success;
	}
	if (transaction.type === "DEBIT") {
		return COLORS.danger;
	}
	return COLORS.blue;
};

const getTransactionIcon = (
	transaction: Transaction,
): React.ComponentProps<typeof Ionicons>["name"] => {
	if (transaction.type === "CREDIT") {
		return "arrow-down";
	}
	if (transaction.type === "DEBIT") {
		return "arrow-up";
	}
	return "swap-horizontal";
};

const TransactionCard = ({
	transaction,
	onPress,
	onLongPress,
}: TransactionCardProps): React.JSX.Element => {
	const color = getTransactionColor(transaction);

	return (
		<Pressable onPress={onPress} onLongPress={onLongPress}>
			<GlassCard>
				<View style={styles.row}>
					<View
						style={[
							styles.typeIcon,
							{
								backgroundColor: `${color}20`,
							},
						]}
					>
						<Ionicons
							color={color}
							name={getTransactionIcon(transaction)}
							size={22}
						/>
					</View>
					<View style={styles.details}>
						<View style={styles.headingRow}>
							<CustomText numberOfLines={5} style={styles.reason}>
								{getTransactionDisplayReason(transaction)}
							</CustomText>
							{transaction.hasAttachment ? (
								<Ionicons
									color={COLORS.textMuted}
									name="attach"
									size={15}
								/>
							) : null}
						</View>
						<CustomText style={styles.meta}>
							{transaction.classification === "INVESTMENT"
								? transaction.investmentName
								: transaction.type === "TRANSFER"
									? `${transaction.sourceName} -> ${transaction.destinationSourceName ?? ""}`
									: `${transaction.sourceName} · ${transaction.categoryName ?? ""}`}
						</CustomText>
						{transaction.tripName ? (
							<CustomText style={styles.trip}>
								{transaction.tripName}
							</CustomText>
						) : null}
						<CustomText style={styles.date}>
							{formatDate(transaction.transactionAt)}
						</CustomText>
					</View>
					<View style={styles.amountColumn}>
						<CustomText style={[styles.amount, { color }]}>
							{transaction.type === "DEBIT"
								? "-"
								: transaction.type === "CREDIT"
									? "+"
									: ""}
							{formatMoney(
								transaction.amount,
								transaction.sourceCurrencyCode,
							)}
						</CustomText>
						{transaction.type === "TRANSFER" &&
						transaction.toAmount &&
						transaction.destinationCurrencyCode ? (
							<CustomText style={styles.toAmount}>
								{"-> "}
								{formatMoney(
									transaction.toAmount,
									transaction.destinationCurrencyCode,
								)}
							</CustomText>
						) : null}
					</View>
				</View>
			</GlassCard>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 11,
	},
	typeIcon: {
		width: 43,
		height: 43,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
	},
	details: {
		flex: 1,
		gap: 3,
		maxWidth: "50%",
	},
	headingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	reason: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
		flexShrink: 1,
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	trip: {
		color: COLORS.primaryBright,
		fontSize: 11,
		fontWeight: "700",
	},
	date: {
		color: COLORS.textDim,
		fontSize: 11,
	},
	amountColumn: {
		alignItems: "flex-end",
		gap: 3,
	},
	amount: {
		fontSize: 14,
		fontWeight: "900",
		textAlign: "right",
	},
	toAmount: {
		color: COLORS.textMuted,
		fontSize: 11,
		fontWeight: "700",
	},
});

export { TransactionCard };
