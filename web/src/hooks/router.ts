import type { RelationKind } from "@/types/RelationKind";
import type { VaultKind } from "@/types/VaultKind";

export type { RelationKind, VaultKind };

export type Route =
	| { page: "dashboard" }
	| { page: "transactions" }
	| { page: "transaction-form"; transactionId?: string; cloneFromId?: string }
	| { page: "relations"; kind: RelationKind }
	| { page: "relation-form"; kind: RelationKind; entityId?: string }
	| {
			page: "linked-transactions";
			kind: RelationKind;
			entityId: string;
			entityName: string;
	  }
	| { page: "budgets" }
	| { page: "budget-form"; budgetId?: string }
	| { page: "analysis" }
	| { page: "exchange-rates" }
	| { page: "notes" }
	| { page: "note-form"; noteId?: string }
	| { page: "todos" }
	| { page: "todo-form"; todoId?: string }
	| { page: "vault"; kind: VaultKind }
	| { page: "vault-form"; kind: VaultKind; entryId?: string }
	| { page: "global-search" }
	| { page: "settings" };
