import { Sidebar } from "@/components/Sidebar";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";

import { AnalysisPage } from "@/pages/AnalysisPage";
import { BudgetFormPage } from "@/pages/BudgetFormPage";
import { BudgetsPage } from "@/pages/BudgetsPage";
import {
	NoteFormPage,
	NotesPage,
	TodoFormPage,
	TodosPage,
} from "@/pages/ContentPages";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExchangeRatesPage } from "@/pages/ExchangeRatesPage";
import { GlobalSearchPage } from "@/pages/GlobalSearchPage";
import { LinkedTransactionsPage } from "@/pages/LinkedTransactionsPage";
import { RelationFormPage } from "@/pages/RelationFormPage";
import { RelationsPage } from "@/pages/RelationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TransactionFormPage } from "@/pages/TransactionFormPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { VaultFormPage, VaultPage } from "@/pages/VaultPages";

const PAGE_TITLES: Record<string, string> = {
	dashboard: "Dashboard",
	transactions: "Transactions",
	"transaction-form": "Transaction",
	relations: "Relations",
	"relation-form": "Edit",
	"linked-transactions": "Linked Transactions",
	budgets: "Budgets",
	"budget-form": "Budget",
	analysis: "Analysis",
	"exchange-rates": "Exchange Rates",
	notes: "Notes",
	"note-form": "Note",
	todos: "Todos",
	"todo-form": "Todo",
	vault: "Vault",
	"vault-form": "Vault Entry",
	"global-search": "Search",
	settings: "Settings",
};

const PageContent = () => {
	const { route } = useRouter();

	switch (route.page) {
		case "dashboard":
			return <DashboardPage />;
		case "transactions":
			return <TransactionsPage />;
		case "transaction-form":
			return (
				<TransactionFormPage
					transactionId={route.transactionId}
					cloneFromId={route.cloneFromId}
				/>
			);
		case "relations":
			return <RelationsPage kind={route.kind} />;
		case "relation-form":
			return (
				<RelationFormPage kind={route.kind} entityId={route.entityId} />
			);
		case "linked-transactions":
			return (
				<LinkedTransactionsPage
					kind={route.kind}
					entityId={route.entityId}
					entityName={route.entityName}
				/>
			);
		case "budgets":
			return <BudgetsPage />;
		case "budget-form":
			return <BudgetFormPage budgetId={route.budgetId} />;
		case "analysis":
			return <AnalysisPage />;
		case "exchange-rates":
			return <ExchangeRatesPage />;
		case "notes":
			return <NotesPage />;
		case "note-form":
			return <NoteFormPage noteId={route.noteId} />;
		case "todos":
			return <TodosPage />;
		case "todo-form":
			return <TodoFormPage todoId={route.todoId} />;
		case "vault":
			return <VaultPage kind={route.kind} />;
		case "vault-form":
			return <VaultFormPage kind={route.kind} entryId={route.entryId} />;
		case "global-search":
			return <GlobalSearchPage />;
		case "settings":
			return <SettingsPage />;
		default:
			return <DashboardPage />;
	}
};

const getTitle = (
	route: { page: string } & Record<string, unknown>,
): string => {
	if (route.page === "relations" && "kind" in route) {
		const kindLabels: Record<string, string> = {
			SOURCE: "Sources",
			CATEGORY: "Categories",
			TRIP: "Trips",
			INVESTMENT: "Investments",
		};
		return kindLabels[route.kind as string] ?? "Relations";
	}
	if (route.page === "vault" && "kind" in route) {
		const kindLabels: Record<string, string> = {
			PASSWORD: "Passwords",
			CARD: "Cards",
			IDENTITY: "Identities",
		};
		return kindLabels[route.kind as string] ?? "Vault";
	}
	if (route.page === "linked-transactions" && "entityName" in route)
		return route.entityName as string;
	return PAGE_TITLES[route.page] ?? route.page;
};

export const App = () => {
	const { isLoading } = useDb();
	const { route } = useRouter();

	if (isLoading) {
		return (
			<div className="loading-screen">
				<div className="spinner" />
				<div style={{ color: "var(--text-muted)", fontSize: 14 }}>
					Loading database...
				</div>
			</div>
		);
	}

	return (
		<div className="app-layout">
			<Sidebar />
			<div className="main-area">
				<div className="topbar">
					<div className="topbar-title">
						{getTitle(
							route as { page: string } & Record<string, unknown>,
						)}
					</div>
				</div>
				<div className="page-content">
					<PageContent />
				</div>
			</div>
		</div>
	);
};
