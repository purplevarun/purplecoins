import type HomeMode from "@/types/HomeMode";
import type RelationKind from "@/types/RelationKind";
import type VaultKind from "@/types/VaultKind";

type RootStackParamList = {
	Home: undefined;
	Transactions: undefined;
	TransactionForm:
		{ transactionId?: string; cloneFromTransactionId?: string } | undefined;
	Sources: undefined;
	SourceForm: { entityId?: string } | undefined;
	Categories: undefined;
	CategoryForm: { entityId?: string } | undefined;
	Trips: undefined;
	TripForm: { entityId?: string } | undefined;
	Investments: undefined;
	InvestmentForm: { entityId?: string } | undefined;
	ArchivedRelations: undefined;
	LinkedTransactions: {
		kind: RelationKind;
		entityId: string;
		entityName: string;
		dateRangeStart?: number;
		dateRangeEnd?: number;
		dateRangeLabel?: string;
	};
	Budgets: undefined;
	BudgetForm: { budgetId?: string } | undefined;
	Analysis: undefined;
	AnalysisDetails: {
		mode: "CATEGORIES" | "INVESTMENTS";
		dateRangeStart?: number;
		dateRangeEnd?: number;
		dateRangeLabel?: string;
	};
	ExchangeRates: undefined;
	GlobalSearch: { mode: HomeMode };
	Notes: undefined;
	NoteForm: { noteId?: string } | undefined;
	Todos: undefined;
	TodoForm: { todoId?: string } | undefined;
	Vault: { kind: VaultKind };
	VaultForm: { kind: VaultKind; entryId?: string };
	Settings: undefined;
};

export type { RootStackParamList as default };
