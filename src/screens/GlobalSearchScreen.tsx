import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { getCards } from "@/services/cardService";
import { getCategories } from "@/services/categoryService";
import { getIdentities } from "@/services/identityService";
import { getInvestments } from "@/services/investmentService";
import { getNotes } from "@/services/noteService";
import { getPasswords } from "@/services/passwordService";
import { getSources } from "@/services/sourceService";
import { getTodos } from "@/services/todoService";
import {
	getTransactionDisplayReason,
	getTransactions,
} from "@/services/transactionService";
import { getTrips } from "@/services/tripService";
import type { GlobalSearchResult } from "@/types/GlobalSearchResult";
import type { GlobalSearchResultKind } from "@/types/GlobalSearchResultKind";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";

type GlobalSearchScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"GlobalSearch"
>;

const MINIMUM_SEARCH_LENGTH = 2;

const getKindLabel = (kind: GlobalSearchResultKind): string =>
	kind.charAt(0) + kind.slice(1).toLowerCase();

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
				transactions,
				sources,
				categories,
				trips,
				investments,
				notes,
				todos,
				passwords,
				cards,
				identities,
			] = await Promise.all([
				getTransactions(database),
				getSources(database),
				getCategories(database),
				getTrips(database),
				getInvestments(database),
				getNotes(database),
				getTodos(database),
				getPasswords(database),
				getCards(database),
				getIdentities(database),
			]);

			setResults([
				...transactions.map(
					(transaction): GlobalSearchResult => ({
						id: transaction.id,
						kind: "TRANSACTION",
						title: getTransactionDisplayReason(transaction),
						subtitle: `${transaction.sourceName} · ${formatMoney(
							transaction.amount,
							transaction.sourceCurrencyCode,
						)} · ${formatDate(transaction.transactionAt)}`,
						icon: "swap-horizontal",
						color: COLORS.primary,
					}),
				),
				...sources.map(
					(source): GlobalSearchResult => ({
						id: source.id,
						kind: "SOURCE",
						title: source.name,
						subtitle: `Source · ${source.currencyCode}`,
						icon: "wallet-outline",
						color: COLORS.blue,
					}),
				),
				...categories.map(
					(category): GlobalSearchResult => ({
						id: category.id,
						kind: "CATEGORY",
						title: category.name,
						subtitle: category.isIncome
							? "Income category"
							: "Expense category",
						icon: "pricetag-outline",
						color: COLORS.warning,
					}),
				),
				...trips.map(
					(trip): GlobalSearchResult => ({
						id: trip.id,
						kind: "TRIP",
						title: trip.name,
						subtitle: "Trip",
						icon: "airplane-outline",
						color: "#68D5FF",
					}),
				),
				...investments.map(
					(investment): GlobalSearchResult => ({
						id: investment.id,
						kind: "INVESTMENT",
						title: investment.name,
						subtitle: "Investment",
						icon: "trending-up",
						color: COLORS.success,
					}),
				),
				...notes.map(
					(note): GlobalSearchResult => ({
						id: note.id,
						kind: "NOTE",
						title: note.title,
						subtitle: note.folderName ?? "Note",
						icon: "document-text-outline",
						color: COLORS.blue,
					}),
				),
				...todos.map(
					(todo): GlobalSearchResult => ({
						id: todo.id,
						kind: "TODO",
						title: todo.title,
						subtitle: todo.folderName ?? "Todo",
						icon: "checkbox-outline",
						color: COLORS.success,
					}),
				),
				...passwords.map(
					(password): GlobalSearchResult => ({
						id: password.id,
						kind: "PASSWORD",
						title: password.title,
						subtitle: password.username || password.website,
						icon: "key-outline",
						color: COLORS.warning,
					}),
				),
				...cards.map(
					(card): GlobalSearchResult => ({
						id: card.id,
						kind: "CARD",
						title: card.name,
						subtitle: card.network || "Card",
						icon: "card-outline",
						color: COLORS.danger,
					}),
				),
				...identities.map(
					(identity): GlobalSearchResult => ({
						id: identity.id,
						kind: "IDENTITY",
						title: identity.title,
						subtitle: identity.idNumber || "Identity",
						icon: "person-circle-outline",
						color: COLORS.blue,
					}),
				),
			]);
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
	const filteredResults = useMemo(() => {
		if (normalizedSearch.length < MINIMUM_SEARCH_LENGTH) {
			return [];
		}
		return results.filter((result) =>
			`${result.title} ${result.subtitle} ${getKindLabel(result.kind)}`
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
			if (result.kind === "NOTE") {
				navigation.navigate("NoteForm", { noteId: result.id });
				return;
			}
			if (result.kind === "TODO") {
				navigation.navigate("TodoForm", { todoId: result.id });
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
					label="Global search"
					onChangeText={setSearch}
					placeholder="Search transactions, tools and vault"
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
				title="Search Purplecoins"
			/>
		),
		[normalizedSearch.length],
	);

	const renderResult = useCallback(
		({ item: result }: { item: GlobalSearchResult }): React.JSX.Element => (
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

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
	},
	details: {
		flex: 1,
		gap: 3,
	},
	title: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
});

export { GlobalSearchScreen };
