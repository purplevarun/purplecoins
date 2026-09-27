import CustomText from "@/components/CustomText";
import type ListItemProps from "@/types/ListItemProps";

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import TextField from "@/components/TextField";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import attachmentService from "@/services/attachmentService";
import budgetService from "@/services/budgetService";
import cardService from "@/services/cardService";
import categoryService from "@/services/categoryService";
import identityService from "@/services/identityService";
import investmentService from "@/services/investmentService";
import noteService from "@/services/noteService";
import passwordService from "@/services/passwordService";
import sourceService from "@/services/sourceService";
import todoService from "@/services/todoService";
import transactionService from "@/services/transactionService";
import tripService from "@/services/tripService";
import type GlobalSearchResult from "@/types/GlobalSearchResult";
import type GlobalSearchResultKind from "@/types/GlobalSearchResultKind";
import type GlobalSearchScreenProps from "@/types/GlobalSearchScreenProps";
import { getAttachmentOwnerLabel } from "@/utils/attachment";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getAttachments } = attachmentService;
const { getBudgets } = budgetService;
const { getCards } = cardService;
const { getCategories } = categoryService;
const { getIdentities } = identityService;
const { getInvestments } = investmentService;
const { getNotes } = noteService;
const { getPasswords } = passwordService;
const { getSources } = sourceService;
const { getTodos } = todoService;
const { getTransactionDisplayReason, getTransactions } = transactionService;
const { getTrips } = tripService;
const { formatDate } = dateUtils;
const { formatMoney } = moneyUtils;

const MINIMUM_SEARCH_LENGTH = 2;

const getKindLabel = (kind: GlobalSearchResultKind): string =>
	kind
		.split("_")
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(" ");

const GlobalSearchScreen = ({
	navigation,
}: GlobalSearchScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [results, setResults] = useState<readonly GlobalSearchResult[]>([]);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const [
				notes,
				todos,
				passwords,
				cards,
				identities,
				documents,
				transactions,
				sources,
				categories,
				trips,
				investments,
				budgets,
			] = await Promise.all([
				getNotes(database),
				getTodos(database),
				getPasswords(database),
				getCards(database),
				getIdentities(database),
				getAttachments(database),
				getTransactions(database),
				getSources(database),
				getCategories(database),
				getTrips(database),
				getInvestments(database),
				getBudgets(database),
			]);
			setResults([
				...notes.map((note): GlobalSearchResult => ({
					id: note.id,
					kind: "NOTE",
					title: note.title,
					subtitle: note.folderName ?? "Note",
					icon: "document-text-outline",
					color: COLORS.blue,
				})),
				...todos.map((todo): GlobalSearchResult => ({
					id: todo.id,
					kind: "TODO",
					title: todo.title,
					subtitle: todo.folderName ?? "Todo",
					icon: "checkbox-outline",
					color: COLORS.success,
				})),
				...passwords.map((password): GlobalSearchResult => ({
					id: password.id,
					kind: "PASSWORD",
					title: password.title,
					subtitle: password.username || password.website,
					icon: "key-outline",
					color: COLORS.warning,
				})),
				...cards.map((card): GlobalSearchResult => ({
					id: card.id,
					kind: "CARD",
					title: card.name,
					subtitle: card.network || "Card",
					icon: "card-outline",
					color: COLORS.danger,
				})),
				...identities.map((identity): GlobalSearchResult => ({
					id: identity.id,
					kind: "IDENTITY",
					title: identity.title,
					subtitle: identity.idNumber || "Identity",
					icon: "person-circle-outline",
					color: COLORS.blue,
				})),
				...documents.map((document): GlobalSearchResult => ({
					id: document.id,
					kind: "DOCUMENT",
					title: document.fileName,
					subtitle: getAttachmentOwnerLabel(document.ownerType),
					icon: "document-attach-outline",
					color: COLORS.primary,
				})),
				...transactions.map((transaction): GlobalSearchResult => ({
					id: transaction.id,
					kind: "TRANSACTION",
					title: getTransactionDisplayReason(transaction),
					subtitle: `${transaction.sourceName} · ${formatMoney(
						transaction.amount,
						transaction.sourceCurrencyCode,
					)} · ${formatDate(transaction.transactionAt)}`,
					icon: "swap-horizontal",
					color: COLORS.primary,
					searchExtra: `${transaction.amount} ${formatMoney(transaction.amount, transaction.sourceCurrencyCode).replace(/,/g, "")} ${transaction.categoryName ?? ""} ${transaction.tripName ?? ""} ${transaction.investmentName ?? ""} ${transaction.destinationSourceName ?? ""}`,
				})),
				...sources.map((source): GlobalSearchResult => ({
					id: source.id,
					kind: "SOURCE",
					title: source.name,
					subtitle: `Source · ${source.currencyCode}`,
					icon: "wallet-outline",
					color: COLORS.blue,
				})),
				...categories.map((category): GlobalSearchResult => ({
					id: category.id,
					kind: "CATEGORY",
					title: category.name,
					subtitle: category.isIncome
						? "Income category"
						: "Expense category",
					icon: "pricetag-outline",
					color: COLORS.warning,
				})),
				...trips.map((trip): GlobalSearchResult => ({
					id: trip.id,
					kind: "TRIP",
					title: trip.name,
					subtitle: "Trip",
					icon: "airplane-outline",
					color: "#68D5FF",
				})),
				...investments.map((investment): GlobalSearchResult => ({
					id: investment.id,
					kind: "INVESTMENT",
					title: investment.name,
					subtitle: "Investment",
					icon: "trending-up",
					color: COLORS.success,
				})),
				...budgets.map((budget): GlobalSearchResult => ({
					id: budget.id,
					kind: "BUDGET",
					title: budget.categoryName,
					subtitle: `${
						budget.period === "MONTHLY" ? "Monthly" : "Yearly"
					} budget · ${formatMoney(
						budget.amount,
						DEFAULT_CURRENCY_CODE,
					)}`,
					icon: "speedometer-outline",
					color: "#FF8FA3",
					searchExtra: `${budget.period} ${budget.amount}`,
				})),
			]);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			void getScreenData();
		}, 0);
		return () => clearTimeout(timeoutId);
	}, [dataVersion, getScreenData]);

	const normalizedSearch = search.trim().toLowerCase();
	const filteredResults = useMemo(() => {
		if (normalizedSearch.length < MINIMUM_SEARCH_LENGTH) {
			return [];
		}
		return results.filter((result) =>
			`${result.title} ${result.subtitle} ${getKindLabel(result.kind)} ${result.searchExtra ?? ""}`
				.toLowerCase()
				.includes(normalizedSearch),
		);
	}, [normalizedSearch, results]);

	const handleOpenResult = useCallback(
		(result: GlobalSearchResult): void => {
			if (result.kind === "TRANSACTION") {
				navigation.navigate("TransactionForm", {
					transactionId: result.id,
				});
				return;
			}
			if (
				result.kind === "SOURCE" ||
				result.kind === "CATEGORY" ||
				result.kind === "TRIP" ||
				result.kind === "INVESTMENT"
			) {
				navigation.navigate("LinkedTransactions", {
					kind: result.kind,
					entityId: result.id,
					entityName: result.title,
				});
				return;
			}
			if (result.kind === "BUDGET") {
				navigation.navigate("BudgetForm", { budgetId: result.id });
				return;
			}
			if (result.kind === "NOTE") {
				navigation.navigate("NoteForm", { noteId: result.id });
				return;
			}
			if (result.kind === "TODO") {
				navigation.navigate("TodoForm", { todoId: result.id });
				return;
			}
			if (result.kind === "DOCUMENT") {
				navigation.navigate("Documents");
				return;
			}
			navigation.navigate("VaultForm", {
				kind: result.kind,
				entryId: result.id,
			});
		},
		[navigation],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<TextField
					autoCapitalize="none"
					label="Search"
					onChangeText={setSearch}
					placeholder="Search all records"
					value={search}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, search],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="search-outline"
				message={
					normalizedSearch.length < MINIMUM_SEARCH_LENGTH
						? "Type at least two characters."
						: "No matching records found."
				}
				title="Search"
			/>
		),
		[normalizedSearch.length],
	);

	const renderResult = useCallback(
		({
			item: result,
		}: ListItemProps<GlobalSearchResult>): React.JSX.Element => (
			<Pressable onPress={() => handleOpenResult(result)}>
				<GlassCard>
					<View style={styles.row}>
						<View
							style={[
								styles.iconBox,
								{ backgroundColor: `${result.color}20` },
							]}
						>
							<Ionicons
								color={result.color}
								name={result.icon}
								size={22}
							/>
						</View>
						<View style={styles.details}>
							<CustomText style={styles.title}>
								{result.title}
							</CustomText>
							<CustomText style={styles.subtitle}>
								{getKindLabel(result.kind)} ·{" "}
								{result.subtitle || "No details"}
							</CustomText>
						</View>
					</View>
				</GlassCard>
			</Pressable>
		),
		[handleOpenResult],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredResults}
				extraData={search}
				keyExtractor={(result) => `${result.kind}:${result.id}`}
				renderItem={renderResult}
			/>
		</View>
	);
};

const { ALIGN, FLEX, FONT_SIZE, FONT_WEIGHT, RADIUS, SIZES, SPACING } =
	styleConstants;

const styles = StyleSheet.create({
	screen: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.background,
	},
	row: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S12,
	},
	iconBox: {
		width: SIZES.S44,
		height: SIZES.S44,
		borderRadius: RADIUS.S15,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	details: {
		flex: FLEX.FILL,
		gap: SPACING.S3,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
	},
});

export default GlobalSearchScreen;
