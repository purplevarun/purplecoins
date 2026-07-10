import AppError from "@/errors/AppError";
import contentRepository from "@/repositories/contentRepository";
import type Note from "@/types/Note";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteContentRow, getNoteRow, getNoteRows, upsertNoteRow } =
	contentRepository;

const mapNote = (note: Note): Note => ({
	...note,
	hasAttachment: Boolean(note.hasAttachment),
});

const getNotes = async (database: SQLiteDatabase): Promise<readonly Note[]> => {
	const notes = await getNoteRows(database);
	return notes.map(mapNote);
};

const getNote = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Note | null> => {
	const note = await getNoteRow(database, id);
	return note ? mapNote(note) : null;
};

const saveNote = async (
	database: SQLiteDatabase,
	id: string | undefined,
	title: string,
	content: string,
	folderId: string | undefined,
): Promise<string> => {
	const normalizedTitle = title.trim();
	if (!normalizedTitle) {
		throw new AppError("NOTE_TITLE_REQUIRED", "Note title is required.");
	}
	const now = Date.now();
	const existingNote = id ? await getNoteRow(database, id) : null;
	const noteId = id ?? createId();
	await upsertNoteRow(database, {
		id: noteId,
		folderId: folderId ?? null,
		folderName: null,
		title: normalizedTitle,
		content: content.trim(),
		createdAt: existingNote?.createdAt ?? now,
		updatedAt: now,
		hasAttachment: existingNote?.hasAttachment ?? false,
	});
	return noteId;
};

const deleteNote = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => deleteContentRow(database, "notes", "NOTE", id);

const noteService = {
	deleteNote,
	getNote,
	getNotes,
	saveNote,
};

export default noteService;
