import type HomeMode from "@/types/HomeMode";
import type RelationKind from "@/types/RelationKind";
import type TransactionType from "@/types/TransactionType";
import type VaultKind from "@/types/VaultKind";

type RootStackParamList = {
	Home: undefined;
	Transactions: undefined;
	TransactionForm:
		| {
				transactionId?: string;
				cloneFromTransactionId?: string;
				prefillType?: TransactionType;
				prefillAmount?: string;
				prefillReason?: string;
				prefillTransactionAt?: number;
				prefillCategoryId?: string;
				prefillSourceId?: string;
				prefillMerchant?: string;
		  }
		| undefined;
	Relations: { kind: RelationKind };
	RelationForm: { kind: RelationKind; entityId?: string };
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
	ExchangeRates: undefined;
	GlobalSearch: { mode: HomeMode };
	Notes: undefined;
	NoteForm: { noteId?: string } | undefined;
	Todos: undefined;
	TodoForm: { todoId?: string } | undefined;
	Vault: { kind: VaultKind };
	VaultForm: { kind: VaultKind; entryId?: string };
	MergeCategories: undefined;
	Settings: undefined;
};

export type { RootStackParamList as default };
