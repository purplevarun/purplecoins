import { EmptyState, Notice } from "@/components/ui";
import type { Route } from "@/hooks/router";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getCards } from "@/services/cardService";
import { getIdentities } from "@/services/identityService";
import { getNotes } from "@/services/noteService";
import { getPasswords } from "@/services/passwordService";
import { getTodos } from "@/services/todoService";
import { getTransactions } from "@/services/transactionService";
import type { CardEntry } from "@/types/CardEntry";
import type { IdentityEntry } from "@/types/IdentityEntry";
import type { Note } from "@/types/Note";
import type { PasswordEntry } from "@/types/PasswordEntry";
import type { Todo } from "@/types/Todo";
import type { Transaction } from "@/types/Transaction";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";
import { useCallback, useEffect, useMemo, useState } from "react";

type SearchResult = {
	id: string;
	kind: string;
	title: string;
	subtitle: string;
	searchText: string;
	route: Route;
	color: string;
};

const RESULT_ICONS: Record<string, string> = {
	TRANSACTION: "⇄",
	NOTE: "≡",
	TODO: "☑",
	PASSWORD: "⚿",
	CARD: "▬",
	IDENTITY: "◻",
};

const RESULT_COLORS: Record<string, string> = {
	TRANSACTION: "var(--primary)",
	NOTE: "#73B7FF",
	TODO: "var(--success)",
	PASSWORD: "var(--warning)",
	CARD: "#FF8FA3",
	IDENTITY: "var(--blue)",
};

export const GlobalSearchPage = () => {
	const { db, dataVersion } = useDb();
	const { navigate } = useRouter();
	const [search, setSearch] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [error, setError] = useState("");

	const buildIndex = useCallback(async () => {
		if (!db) return;
		try {
			const [txns, notes, todos, passwords, cards, identities] =
				await Promise.all([
					getTransactions(db),
					getNotes(db),
					getTodos(db),
					getPasswords(db),
					getCards(db),
					getIdentities(db),
				]);
			const all: SearchResult[] = [
				...txns.map((t: Transaction) => ({
					id: t.id,
					kind: "TRANSACTION",
					title:
						t.type === "TRANSFER"
							? `${t.sourceName} → ${t.destinationSourceName}`
							: t.reason || "(no reason)",
					subtitle: `${t.sourceName} · ${formatMoney(t.amount, t.sourceCurrencyCode)} · ${formatDate(t.transactionAt)}`,
					searchText:
						`${t.reason} ${t.sourceName} ${t.amount} ${t.amount.replace(/,/g, "")} ${t.categoryName ?? ""} ${t.tripName ?? ""} ${formatDate(t.transactionAt)}`.toLowerCase(),
					route: {
						page: "transaction-form" as const,
						transactionId: t.id,
					},
					color: RESULT_COLORS.TRANSACTION,
				})),
				...notes.map((n: Note) => ({
					id: n.id,
					kind: "NOTE",
					title: n.title || "(no title)",
					subtitle: n.content.slice(0, 60) || "Empty note",
					searchText:
						`${n.title} ${n.content} ${n.folderName ?? ""}`.toLowerCase(),
					route: { page: "note-form" as const, noteId: n.id },
					color: RESULT_COLORS.NOTE,
				})),
				...todos.map((t: Todo) => ({
					id: t.id,
					kind: "TODO",
					title: t.title,
					subtitle: t.isDone
						? "Done"
						: t.dueAt
							? `Due ${formatDate(t.dueAt)}`
							: "Pending",
					searchText:
						`${t.title} ${t.description ?? ""}`.toLowerCase(),
					route: { page: "todo-form" as const, todoId: t.id },
					color: RESULT_COLORS.TODO,
				})),
				...passwords.map((p: PasswordEntry) => ({
					id: p.id,
					kind: "PASSWORD",
					title: p.title,
					subtitle: p.username || p.website || "Password",
					searchText:
						`${p.title} ${p.username} ${p.website}`.toLowerCase(),
					route: {
						page: "vault-form" as const,
						kind: "PASSWORD" as const,
						entryId: p.id,
					},
					color: RESULT_COLORS.PASSWORD,
				})),
				...cards.map((c: CardEntry) => ({
					id: c.id,
					kind: "CARD",
					title: c.name,
					subtitle: c.network || "Card",
					searchText: `${c.name} ${c.network}`.toLowerCase(),
					route: {
						page: "vault-form" as const,
						kind: "CARD" as const,
						entryId: c.id,
					},
					color: RESULT_COLORS.CARD,
				})),
				...identities.map((i: IdentityEntry) => ({
					id: i.id,
					kind: "IDENTITY",
					title: i.title,
					subtitle: i.idNumber || "Identity",
					searchText: `${i.title} ${i.idNumber}`.toLowerCase(),
					route: {
						page: "vault-form" as const,
						kind: "IDENTITY" as const,
						entryId: i.id,
					},
					color: RESULT_COLORS.IDENTITY,
				})),
			];
			setResults(all);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void buildIndex();
	}, [dataVersion, buildIndex]);

	const filtered = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (q.length < 2) return [];
		return results.filter(
			(r) =>
				r.searchText.includes(q) ||
				r.title.toLowerCase().includes(q) ||
				r.subtitle.toLowerCase().includes(q),
		);
	}, [search, results]);

	return (
		<div style={{ maxWidth: 700 }}>
			<input
				className="search-input"
				style={{
					width: "100%",
					fontSize: 16,
					padding: "12px 16px",
					marginBottom: 16,
				}}
				placeholder="Search Everywhere..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				autoFocus
			/>
			{error && <Notice message={error} tone="danger" />}
			{search.length >= 2 && filtered.length === 0 && (
				<EmptyState
					icon="🔍"
					title="No results"
					description={`Nothing found for "${search}".`}
				/>
			)}
			{search.length < 2 && (
				<div
					style={{
						textAlign: "center",
						color: "var(--text-dim)",
						padding: "40px 0",
						fontSize: 14,
					}}
				>
					Type at least 2 characters to search across everything.
				</div>
			)}
			<div className="list">
				{filtered.map((r) => (
					<div
						key={r.id}
						className="list-item"
						onClick={() => navigate(r.route)}
					>
						<div
							style={{
								width: 36,
								height: 36,
								borderRadius: 10,
								background: `${r.color}22`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<span style={{ color: r.color, fontSize: 16 }}>
								{RESULT_ICONS[r.kind]}
							</span>
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									fontWeight: 700,
									color: "var(--text)",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{r.title}
							</div>
							<div
								style={{
									fontSize: 12,
									color: "var(--text-dim)",
									marginTop: 2,
								}}
							>
								{r.subtitle}
							</div>
						</div>
						<div
							style={{
								fontSize: 10,
								fontWeight: 800,
								color: r.color,
								background: `${r.color}22`,
								padding: "3px 8px",
								borderRadius: 999,
								textTransform: "uppercase",
								letterSpacing: 0.5,
							}}
						>
							{r.kind}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
