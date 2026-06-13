import type { RelationKind } from "@/types/RelationKind";
import type { VaultKind } from "@/types/VaultKind";

type RootStackParamList = {
	Dashboard: undefined;
	Transactions: undefined;
	TransactionForm:
		| { transactionId?: string; cloneFromTransactionId?: string }
		| undefined;
	Relations: { kind: RelationKind };
	RelationForm: { kind: RelationKind; entityId?: string };
	LinkedTransactions: {
		kind: RelationKind;
		entityId: string;
		entityName: string;
	};
	Budgets: undefined;
	BudgetForm: { budgetId?: string } | undefined;
	Analysis: undefined;
	ExchangeRates: undefined;
	GlobalSearch: undefined;
	Notes: undefined;
	NoteForm: { noteId?: string } | undefined;
	Todos: undefined;
	TodoForm: { todoId?: string } | undefined;
	Vault: { kind: VaultKind };
	VaultForm: { kind: VaultKind; entryId?: string };
	Settings: undefined;
};

export type { RootStackParamList };
