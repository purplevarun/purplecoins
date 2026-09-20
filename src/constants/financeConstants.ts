const TRANSACTION_CLASSIFICATIONS = ["GENERAL", "INVESTMENT"] as const;
const TRANSACTION_TYPES = ["DEBIT", "CREDIT", "TRANSFER"] as const;
const BUDGET_PERIODS = ["MONTHLY", "YEARLY"] as const;
const ANALYSIS_PERIODS = [
	"MONTH",
	"YEAR",
	"ALL",
	"CUSTOM",
	"FY",
	"YTD",
] as const;
const RELATION_KINDS = ["SOURCE", "CATEGORY", "TRIP", "INVESTMENT"] as const;
const VAULT_KINDS = ["PASSWORD", "CARD", "IDENTITY"] as const;
const ATTACHMENT_OWNER_TYPES = [
	"TRANSACTION",
	"NOTE",
	"TODO",
	"CARD",
	"IDENTITY",
] as const;
const RATE_SOURCES = ["API", "MANUAL"] as const;
const DEFAULT_ANALYSIS_PERIOD = "MONTH" as const;
const DEFAULT_BUDGET_PERIOD = "MONTHLY" as const;
const DEFAULT_TRANSACTION_CLASSIFICATION = "GENERAL" as const;
const DEFAULT_TRANSACTION_TYPE = "DEBIT" as const;
const ANALYSIS_PERIOD_OPTIONS = [
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
	{ label: "FY", value: "FY" },
	{ label: "YTD", value: "YTD" },
	{ label: "All", value: "ALL" },
	{ label: "Custom", value: "CUSTOM" },
] as const;
const BUDGET_PERIOD_OPTIONS = [
	{ label: "Monthly", value: "MONTHLY" },
	{ label: "Yearly", value: "YEARLY" },
] as const;
const TRANSACTION_CLASSIFICATION_OPTIONS = [
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
] as const;
const GENERAL_TRANSACTION_TYPE_OPTIONS = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
	{ label: "Transfer", value: "TRANSFER" },
] as const;
const INVESTMENT_TRANSACTION_TYPE_OPTIONS = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
] as const;
const TRANSACTION_FILTER_OPTIONS = [
	{ label: "All", value: "ALL" },
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
] as const;
const CATEGORY_FILTER_OPTIONS = [
	{ label: "All", value: "ALL" },
	{ label: "Expense", value: "EXPENSE" },
	{ label: "Income", value: "INCOME" },
] as const;
const SOURCE_FILTER_OPTIONS = [
	{ label: "All", value: "ALL" },
	{ label: "Validated", value: "VALIDATED" },
	{ label: "Pending", value: "PENDING_VALIDATION" },
] as const;

const financeConstants = {
	ANALYSIS_PERIODS,
	ANALYSIS_PERIOD_OPTIONS,
	ATTACHMENT_OWNER_TYPES,
	BUDGET_PERIODS,
	BUDGET_PERIOD_OPTIONS,
	CATEGORY_FILTER_OPTIONS,
	DEFAULT_ANALYSIS_PERIOD,
	DEFAULT_BUDGET_PERIOD,
	DEFAULT_TRANSACTION_CLASSIFICATION,
	DEFAULT_TRANSACTION_TYPE,
	GENERAL_TRANSACTION_TYPE_OPTIONS,
	INVESTMENT_TRANSACTION_TYPE_OPTIONS,
	RATE_SOURCES,
	RELATION_KINDS,
	SOURCE_FILTER_OPTIONS,
	TRANSACTION_CLASSIFICATION_OPTIONS,
	TRANSACTION_FILTER_OPTIONS,
	TRANSACTION_CLASSIFICATIONS,
	TRANSACTION_TYPES,
	VAULT_KINDS,
};

export default financeConstants;
