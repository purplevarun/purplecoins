import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	getTransactionDisplayReason,
	getTransactions,
} from "@/services/transactionService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import type { Transaction } from "@/types/Transaction";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";

type TransactionsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Transactions"
>;

const FILTER_OPTIONS: readonly SelectOption[] = [
	{ label: "All", value: "ALL" },
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];

const TransactionsScreen = ({
	navigation,
}: TransactionsScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [filter, setFilter] = useState("ALL");
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTransactions(await getTransactions(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const normalizedSearch = search.trim().toLowerCase();
	const filteredTransactions = transactions.filter((transaction) => {
		const matchesClassification =
			filter === "ALL" || transaction.classification === filter;
		if (!matchesClassification) {
			return false;
		}
		if (!normalizedSearch) {
			return true;
		}
		return [
			getTransactionDisplayReason(transaction),
			transaction.sourceName,
			transaction.destinationSourceName ?? "",
			transaction.categoryName ?? "",
			transaction.tripName ?? "",
			transaction.investmentName ?? "",
			transaction.amount,
		]
			.join(" ")
			.toLowerCase()
			.includes(normalizedSearch);
	});

	const getTypeColor = (transaction: Transaction): string => {
		if (transaction.type === "CREDIT") {
			return COLORS.success;
		}
		if (transaction.type === "DEBIT") {
			return COLORS.danger;
		}
		return COLORS.blue;
	};

	return (
		<View style={styles.screen}>
			<ScreenContainer>
				<SegmentedControl
					onChange={setFilter}
					options={FILTER_OPTIONS}
					value={filter}
				/>
				<TextField
					label="Search"
					onChangeText={setSearch}
					placeholder="Reason, source, category or amount"
					value={search}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
				{filteredTransactions.length === 0 ? (
					<EmptyState
						icon="swap-horizontal-outline"
						message="Add a general or investment transaction."
						title="No transactions found"
					/>
				) : null}
				{filteredTransactions.map((transaction) => (
					<Pressable
						key={transaction.id}
						onPress={() =>
							navigation.navigate("TransactionForm", {
								transactionId: transaction.id,
							})
						}
					>
						<GlassCard>
							<View style={styles.row}>
								<View
									style={[
										styles.typeIcon,
										{
											backgroundColor: `${getTypeColor(transaction)}20`,
										},
									]}
								>
									<Ionicons
										color={getTypeColor(transaction)}
										name={
											transaction.type === "CREDIT"
												? "arrow-down"
												: transaction.type === "DEBIT"
													? "arrow-up"
													: "swap-horizontal"
										}
										size={22}
									/>
								</View>
								<View style={styles.details}>
									<View style={styles.headingRow}>
										<Text
											numberOfLines={1}
											style={styles.reason}
										>
											{getTransactionDisplayReason(
												transaction,
											)}
										</Text>
										{transaction.hasAttachment ? (
											<Ionicons
												color={COLORS.textMuted}
												name="attach"
												size={15}
											/>
										) : null}
									</View>
									<Text style={styles.meta}>
										{transaction.classification ===
										"INVESTMENT"
											? transaction.investmentName
											: transaction.type === "TRANSFER"
												? `${transaction.sourceName} → ${transaction.destinationSourceName ?? ""}`
												: `${transaction.sourceName} · ${transaction.categoryName ?? ""}`}
									</Text>
									{transaction.tripName ? (
										<Text style={styles.trip}>
											{transaction.tripName}
										</Text>
									) : null}
									<Text style={styles.date}>
										{formatDate(transaction.transactionAt)}
									</Text>
								</View>
								<View style={styles.amountColumn}>
									<Text
										style={[
											styles.amount,
											{
												color: getTypeColor(
													transaction,
												),
											},
										]}
									>
										{transaction.type === "DEBIT"
											? "−"
											: transaction.type === "CREDIT"
												? "+"
												: ""}
										{formatMoney(
											transaction.amount,
											transaction.sourceCurrencyCode,
										)}
									</Text>
									{transaction.type === "TRANSFER" &&
									transaction.toAmount &&
									transaction.destinationCurrencyCode ? (
										<Text style={styles.toAmount}>
											→{" "}
											{formatMoney(
												transaction.toAmount,
												transaction.destinationCurrencyCode,
											)}
										</Text>
									) : null}
								</View>
							</View>
						</GlassCard>
					</Pressable>
				))}
			</ScreenContainer>
			<FloatingAddButton
				onPress={() => navigation.navigate("TransactionForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
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
		maxWidth: "35%",
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

export { TransactionsScreen };
