import {
	BackButton,
	Chips,
	ConfirmModal,
	EmptyState,
	Field,
	GlassCard,
	IconPlus,
	IconTrash,
	Notice,
	SelectInput,
	TextInput,
	TextareaInput,
} from "@/components/ui";
import {
	FOLDER_FILTER_ALL,
	FOLDER_FILTER_NONE,
} from "@/constants/folderConstants";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { createFolder, getFolders } from "@/services/folderService";
import { deleteNote, getNotes, saveNote } from "@/services/noteService";
import {
	deleteTodo,
	getTodos,
	saveTodo,
	toggleTodo,
} from "@/services/todoService";
import type { Folder } from "@/types/Folder";
import type { Note } from "@/types/Note";
import type { Todo } from "@/types/Todo";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { useCallback, useEffect, useMemo, useState } from "react";

// ── Notes List ───────────────────────────────────────────────────────────────
export const NotesPage = () => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const [notes, setNotes] = useState<readonly Note[]>([]);
	const [folders, setFolders] = useState<readonly Folder[]>([]);
	const [folderId, setFolderId] = useState(FOLDER_FILTER_ALL);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			const [n, f] = await Promise.all([
				getNotes(db),
				getFolders(db, "NOTE"),
			]);
			setNotes(n);
			setFolders(f);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const folderOpts = [
		{ id: FOLDER_FILTER_ALL, name: "All" },
		{ id: FOLDER_FILTER_NONE, name: "No folder" },
		...folders,
	];

	const filtered = useMemo(() => {
		let list = notes;
		if (folderId === FOLDER_FILTER_NONE)
			list = list.filter((n) => !n.folderId);
		else if (folderId !== FOLDER_FILTER_ALL)
			list = list.filter((n) => n.folderId === folderId);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter(
				(n) =>
					n.title.toLowerCase().includes(q) ||
					n.content.toLowerCase().includes(q),
			);
		}
		return list;
	}, [notes, folderId, search]);

	const handleDelete = async (note: Note) => {
		if (!db) return;
		try {
			await deleteNote(db, note.id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<input
					className="search-input"
					placeholder="Search notes..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button
					className="btn btn-primary"
					style={{ marginLeft: "auto" }}
					onClick={() => navigate({ page: "note-form" })}
				>
					<IconPlus size={14} /> New note
				</button>
			</div>
			<div style={{ marginBottom: 12 }}>
				<Chips
					options={folderOpts}
					value={folderId}
					onChange={setFolderId}
				/>
			</div>
			{error && <Notice message={error} tone="danger" />}
			{filtered.length === 0 ? (
				<EmptyState
					icon="≡"
					title="No notes"
					description="Capture something worth remembering."
				/>
			) : (
				<div className="list">
					{filtered.map((n) => (
						<GlassCard key={n.id}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<div
									style={{ flex: 1, cursor: "pointer" }}
									onClick={() =>
										navigate({
											page: "note-form",
											noteId: n.id,
										})
									}
								>
									<div
										style={{
											fontWeight: 800,
											color: "var(--text)",
										}}
									>
										{n.title || "(no title)"}
									</div>
									{n.content && (
										<div
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
												marginTop: 3,
												whiteSpace: "pre-wrap",
												maxHeight: 40,
												overflow: "hidden",
											}}
										>
											{n.content}
										</div>
									)}
									<div
										style={{
											fontSize: 11,
											color: "var(--text-dim)",
											marginTop: 4,
										}}
									>
										{n.folderName
											? `📁 ${n.folderName} · `
											: ""}
										{formatDate(n.updatedAt)}
									</div>
								</div>
								<button
									className="btn-icon btn"
									onClick={() => setDeleteTarget(n)}
								>
									<IconTrash size={13} />
								</button>
							</div>
						</GlassCard>
					))}
				</div>
			)}
			{deleteTarget && (
				<ConfirmModal
					title="Delete note?"
					message="This note will be permanently removed."
					confirmLabel="Delete"
					onConfirm={() => handleDelete(deleteTarget)}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
};

// ── Note Form ────────────────────────────────────────────────────────────────
export const NoteFormPage = ({ noteId }: { noteId?: string }) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [folderId, setFolderId] = useState("");
	const [folders, setFolders] = useState<readonly Folder[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [newFolder, setNewFolder] = useState("");

	useEffect(() => {
		if (!db) return;
		const load = async () => {
			const [f, existing] = await Promise.all([
				getFolders(db, "NOTE"),
				noteId
					? ((await getNotes(db)).find((n) => n.id === noteId) ??
						null)
					: Promise.resolve(null),
			]);
			setFolders(f);
			if (existing) {
				setTitle(existing.title);
				setContent(existing.content);
				setFolderId(existing.folderId ?? "");
			}
		};
		void load();
	}, [db, noteId]);

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			let finalFolderId = folderId;
			if (newFolder.trim()) {
				finalFolderId = await createFolder(
					db,
					newFolder.trim(),
					"NOTE",
				);
			}
			await saveNote(
				db,
				noteId,
				title,
				content,
				finalFolderId || undefined,
			);
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
		}
	};

	const folderOpts = [
		{ label: "No folder", value: "" },
		...folders.map((f) => ({ label: f.name, value: f.id })),
	];

	return (
		<div className="page-form">
			<BackButton onClick={back} />
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "var(--text)",
					marginBottom: 4,
				}}
			>
				{noteId ? "Edit note" : "New note"}
			</div>
			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<Field label="Title">
						<TextInput
							value={title}
							onChange={setTitle}
							placeholder="Note title"
							autoFocus
						/>
					</Field>
					<Field label="Content">
						<TextareaInput
							value={content}
							onChange={setContent}
							placeholder="Write anything..."
							rows={6}
						/>
					</Field>
					<Field label="Folder">
						<SelectInput
							value={folderId}
							onChange={setFolderId}
							options={folderOpts}
						/>
					</Field>
					<Field label="Or create new folder">
						<TextInput
							value={newFolder}
							onChange={setNewFolder}
							placeholder="New folder name..."
						/>
					</Field>
				</div>
			</GlassCard>
			{error && <Notice message={error} tone="danger" />}
			<div className="form-actions">
				<button
					className="btn btn-primary"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : noteId ? "Update" : "Save"}
				</button>
				<button className="btn btn-secondary" onClick={back}>
					Cancel
				</button>
			</div>
		</div>
	);
};

// ── Todos List ───────────────────────────────────────────────────────────────
export const TodosPage = () => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const [todos, setTodos] = useState<readonly Todo[]>([]);
	const [folders, setFolders] = useState<readonly Folder[]>([]);
	const [folderId, setFolderId] = useState(FOLDER_FILTER_ALL);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			const [t, f] = await Promise.all([
				getTodos(db),
				getFolders(db, "TODO"),
			]);
			setTodos(t);
			setFolders(f);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const folderOpts = [
		{ id: FOLDER_FILTER_ALL, name: "All" },
		{ id: FOLDER_FILTER_NONE, name: "No folder" },
		...folders,
	];

	const filtered = useMemo(() => {
		if (folderId === FOLDER_FILTER_ALL) return todos;
		if (folderId === FOLDER_FILTER_NONE)
			return todos.filter((t) => !t.folderId);
		return todos.filter((t) => t.folderId === folderId);
	}, [todos, folderId]);

	const handleToggle = async (todo: Todo) => {
		if (!db) return;
		try {
			await toggleTodo(db, todo.id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	const handleDelete = async (todo: Todo) => {
		if (!db) return;
		try {
			await deleteTodo(db, todo.id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<Chips
					options={folderOpts}
					value={folderId}
					onChange={setFolderId}
				/>
				<button
					className="btn btn-primary"
					onClick={() => navigate({ page: "todo-form" })}
				>
					<IconPlus size={14} /> New todo
				</button>
			</div>
			{error && <Notice message={error} tone="danger" />}
			{filtered.length === 0 ? (
				<EmptyState
					icon="☑"
					title="No todos"
					description="Add something you need to finish."
				/>
			) : (
				<div className="list">
					{filtered.map((t) => (
						<GlassCard key={t.id}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
								}}
							>
								<button
									onClick={() => handleToggle(t)}
									style={{
										width: 20,
										height: 20,
										borderRadius: 5,
										border: `2px solid ${t.isDone ? "var(--success)" : "var(--border)"}`,
										background: t.isDone
											? "var(--success-muted)"
											: "transparent",
										cursor: "pointer",
										flexShrink: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "var(--success)",
										fontWeight: 900,
										fontSize: 12,
									}}
								>
									{t.isDone ? "✓" : ""}
								</button>
								<div
									style={{ flex: 1, cursor: "pointer" }}
									onClick={() =>
										navigate({
											page: "todo-form",
											todoId: t.id,
										})
									}
								>
									<div
										style={{
											fontWeight: 800,
											color: t.isDone
												? "var(--text-dim)"
												: "var(--text)",
											textDecoration: t.isDone
												? "line-through"
												: "none",
										}}
									>
										{t.title}
									</div>
									{t.description && (
										<div
											style={{
												fontSize: 12,
												color: "var(--text-dim)",
												marginTop: 2,
											}}
										>
											{t.description}
										</div>
									)}
									{t.dueAt && (
										<div
											style={{
												fontSize: 11,
												color: "var(--warning)",
												marginTop: 3,
											}}
										>
											Due {formatDate(t.dueAt)}
										</div>
									)}
								</div>
								<button
									className="btn-icon btn"
									onClick={() => setDeleteTarget(t)}
								>
									<IconTrash size={13} />
								</button>
							</div>
						</GlassCard>
					))}
				</div>
			)}
			{deleteTarget && (
				<ConfirmModal
					title="Delete todo?"
					message="This todo will be permanently removed."
					confirmLabel="Delete"
					onConfirm={() => handleDelete(deleteTarget)}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
};

// ── Todo Form ────────────────────────────────────────────────────────────────
export const TodoFormPage = ({ todoId }: { todoId?: string }) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueAt, setDueAt] = useState<number | null>(null);
	const [folderId, setFolderId] = useState("");
	const [folders, setFolders] = useState<readonly Folder[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!db) return;
		const load = async () => {
			const [f, all] = await Promise.all([
				getFolders(db, "TODO"),
				getTodos(db),
			]);
			setFolders(f);
			const existing = todoId ? all.find((t) => t.id === todoId) : null;
			if (existing) {
				setTitle(existing.title);
				setDescription(existing.description ?? "");
				setDueAt(existing.dueAt ?? null);
				setFolderId(existing.folderId ?? "");
			}
		};
		void load();
	}, [db, todoId]);

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			await saveTodo(db, {
				id: todoId,
				title,
				description: description || "",
				dueAt: dueAt ?? undefined,
				isDone: false,
				folderId: folderId || undefined,
			});
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
		}
	};

	const folderOpts = [
		{ label: "No folder", value: "" },
		...folders.map((f) => ({ label: f.name, value: f.id })),
	];

	return (
		<div className="page-form">
			<BackButton onClick={back} />
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "var(--text)",
					marginBottom: 4,
				}}
			>
				{todoId ? "Edit todo" : "New todo"}
			</div>
			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<Field label="Title">
						<TextInput
							value={title}
							onChange={setTitle}
							placeholder="What needs to be done?"
							autoFocus
						/>
					</Field>
					<Field label="Description (optional)">
						<TextareaInput
							value={description}
							onChange={setDescription}
							placeholder="More details..."
							rows={3}
						/>
					</Field>
					<Field label="Due date (optional)">
						<input
							type="date"
							value={
								dueAt
									? new Date(dueAt).toISOString().slice(0, 10)
									: ""
							}
							onChange={(e) =>
								setDueAt(
									e.target.value
										? new Date(e.target.value).getTime()
										: null,
								)
							}
						/>
					</Field>
					<Field label="Folder">
						<SelectInput
							value={folderId}
							onChange={setFolderId}
							options={folderOpts}
						/>
					</Field>
				</div>
			</GlassCard>
			{error && <Notice message={error} tone="danger" />}
			<div className="form-actions">
				<button
					className="btn btn-primary"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : todoId ? "Update" : "Save"}
				</button>
				<button className="btn btn-secondary" onClick={back}>
					Cancel
				</button>
			</div>
		</div>
	);
};
