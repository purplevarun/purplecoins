import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import budgetService from "@/services/budgetService";
import cardService from "@/services/cardService";
import categoryService from "@/services/categoryService";
import exchangeRateService from "@/services/exchangeRateService";
import globalSearchService from "@/services/globalSearchService";
import identityService from "@/services/identityService";
import investmentService from "@/services/investmentService";
import noteService from "@/services/noteService";
import passwordService from "@/services/passwordService";
import sourceService from "@/services/sourceService";
import todoService from "@/services/todoService";
import transactionService from "@/services/transactionService";
import tripService from "@/services/tripService";
import type GlobalSearchResult from "@/types/GlobalSearchResult";
import type RootStackParamList from "@/types/RootStackParamList";
import getErrorMessage from "@/utils/error";
const { getBudgets } = budgetService;
const { getCards } = cardService;
const { getCategories } = categoryService;
const { getExchangeRates } = exchangeRateService;
const { getIdentities } = identityService;
const { getInvestments } = investmentService;
const { getNotes } = noteService;
const { getPasswords } = passwordService;
const { getSources } = sourceService;
const { getTodos } = todoService;
const { getTransactions } = transactionService;
const { getTrips } = tripService;
const {
	buildFinanceResults,
	buildToolsResults,
	buildVaultResults,
	filterSearchResults,
	getKindLabel,
	getModeLabel,
	MINIMUM_SEARCH_LENGTH,
} = globalSearchService;

type GlobalSearchScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"GlobalSearch"
>;

const GlobalSearchScreen = ({
	navigation,
	route,
}: GlobalSearchScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const { mode } = route.params;
	const [results, setResults] = useState<readonly GlobalSearchResult[]>([]);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			if (mode === "TOOLS") {
				const [notes, todos] = await Promise.all([
					getNotes(database),
					getTodos(database),
				]);
				setResults(buildToolsResults(notes, todos));
			} else if (mode === "FINANCE") {
				const [
					transactions,
					sources,
					categories,
					trips,
					investments,
					budgets,
					exchangeRates,
				] = await Promise.all([
					getTransactions(database),
					getSources(database),
					getCategories(database),
					getTrips(database),
					getInvestments(database),
					getBudgets(database),
					getExchangeRates(database),
				]);
				setResults(
					buildFinanceResults(
						transactions,
						sources,
						categories,
						trips,
						investments,
						budgets,
						exchangeRates,
					),
				);
			} else {
				const [passwords, cards, identities] = await Promise.all([
					getPasswords(database),
					getCards(database),
					getIdentities(database),
				]);
				setResults(buildVaultResults(passwords, cards, identities));
			}
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, mode]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			void getScreenData();
		}, 0);
		return () => clearTimeout(timeoutId);
	}, [dataVersion, getScreenData]);

	const normalizedSearch = search.trim().toLowerCase();
	const filteredResults = useMemo(
		() => filterSearchResults(results, search),
		[results, search],
	);

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
			if (result.kind === "EXCHANGE_RATE") {
				navigation.navigate("ExchangeRates");
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
					label={`${getModeLabel(mode)} search`}
					onChangeText={setSearch}
					placeholder={`Search ${getModeLabel(mode)}`}
					value={search}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, mode, search],
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
				title={`Search ${getModeLabel(mode)}`}
			/>
		),
		[mode, normalizedSearch.length],
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
				extraData={[mode, search]}
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

export default GlobalSearchScreen;
