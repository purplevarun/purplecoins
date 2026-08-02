import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import transactionService from "@/services/transactionService";
import type Budget from "@/types/Budget";
import type CardEntry from "@/types/CardEntry";
import type Category from "@/types/Category";
import type ExchangeRate from "@/types/ExchangeRate";
import type GlobalSearchResult from "@/types/GlobalSearchResult";
import type GlobalSearchResultKind from "@/types/GlobalSearchResultKind";
import type HomeMode from "@/types/HomeMode";
import type IdentityEntry from "@/types/IdentityEntry";
import type Investment from "@/types/Investment";
import type Note from "@/types/Note";
import type PasswordEntry from "@/types/PasswordEntry";
import type Source from "@/types/Source";
import type Todo from "@/types/Todo";
import type Transaction from "@/types/Transaction";
import type Trip from "@/types/Trip";
import dateUtils from "@/utils/date";
import moneyUtils from "@/utils/money";

const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getTransactionDisplayReason } = transactionService;
const { formatDate } = dateUtils;
const { formatMoney } = moneyUtils;

const MINIMUM_SEARCH_LENGTH = 2;

/**
 * Turns a SCREAMING_SNAKE_CASE result kind into a human-readable label,
 * e.g. "EXCHANGE_RATE" -> "Exchange Rate".
 */
const getKindLabel = (kind: GlobalSearchResultKind): string =>
	kind
		.split("_")
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(" ");

/** Turns a HomeMode into a title-cased label, e.g. "FINANCE" -> "Finance". */
const getModeLabel = (mode: HomeMode): string =>
	mode.charAt(0) + mode.slice(1).toLowerCase();

const buildToolsResults = (
	notes: readonly Note[],
	todos: readonly Todo[],
): readonly GlobalSearchResult[] => [
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
	];

const buildFinanceResults = (
	transactions: readonly Transaction[],
	sources: readonly Source[],
	categories: readonly Category[],
	trips: readonly Trip[],
	investments: readonly Investment[],
	budgets: readonly Budget[],
	exchangeRates: readonly ExchangeRate[],
): readonly GlobalSearchResult[] => [
		...transactions.map((transaction): GlobalSearchResult => {
			const formattedAmount = formatMoney(
				transaction.amount,
				transaction.sourceCurrencyCode,
			);
			return {
				id: transaction.id,
				kind: "TRANSACTION",
				title: getTransactionDisplayReason(transaction),
				subtitle: `${transaction.sourceName} · ${formattedAmount} · ${formatDate(transaction.transactionAt)}`,
				icon: "swap-horizontal",
				color: COLORS.primary,
				searchExtra: `${transaction.amount} ${formattedAmount.replace(/,/g, "")} ${transaction.categoryName ?? ""} ${transaction.tripName ?? ""} ${transaction.investmentName ?? ""} ${transaction.destinationSourceName ?? ""}`,
			};
		}),
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
			subtitle:
				category.type === "INCOME"
					? "Income category"
					: category.type === "REFUND"
						? "Refund category"
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
			subtitle: `${budget.period === "MONTHLY" ? "Monthly" : "Yearly"
				} budget · ${formatMoney(budget.amount, DEFAULT_CURRENCY_CODE)}`,
			icon: "speedometer-outline",
			color: "#FF8FA3",
			searchExtra: `${budget.period} ${budget.amount}`,
		})),
		...exchangeRates.map((rate): GlobalSearchResult => ({
			id: rate.currencyCode,
			kind: "EXCHANGE_RATE",
			title: rate.currencyCode,
			subtitle: `Exchange rate · ${formatMoney(rate.rateToInr, DEFAULT_CURRENCY_CODE)}`,
			icon: "earth-outline",
			color: "#66E0C2",
			searchExtra: `${rate.source} ${rate.rateToInr}`,
		})),
	];

const buildVaultResults = (
	passwords: readonly PasswordEntry[],
	cards: readonly CardEntry[],
	identities: readonly IdentityEntry[],
): readonly GlobalSearchResult[] => [
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
	];

/**
 * Applies the screen's search-box behavior: results stay empty until the
 * user has typed at least `MINIMUM_SEARCH_LENGTH` characters, after which
 * matching is a case-insensitive substring match across the title,
 * subtitle, human-readable kind label, and any extra hidden search terms.
 */
const filterSearchResults = (
	results: readonly GlobalSearchResult[],
	search: string,
): readonly GlobalSearchResult[] => {
	const normalizedSearch = search.trim().toLowerCase();
	if (normalizedSearch.length < MINIMUM_SEARCH_LENGTH) {
		return [];
	}
	return results.filter((result) =>
		`${result.title} ${result.subtitle} ${getKindLabel(result.kind)} ${result.searchExtra ?? ""}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
};

const globalSearchService = {
	MINIMUM_SEARCH_LENGTH,
	buildFinanceResults,
	buildToolsResults,
	buildVaultResults,
	filterSearchResults,
	getKindLabel,
	getModeLabel,
};

export default globalSearchService;
