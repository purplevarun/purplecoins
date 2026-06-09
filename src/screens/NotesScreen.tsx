import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { FolderFilterChips } from "@/components/FolderFilterChips";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { COLORS } from "@/constants/colors";
import {
	FOLDER_FILTER_ALL,
	FOLDER_FILTER_NONE,
} from "@/constants/folderConstants";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { useFolders } from "@/hooks/useFolders";
import { getNotes } from "@/services/noteService";
import type { Note } from "@/types/Note";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { formatDateTime } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";

type NotesScreenProps = NativeStackScreenProps<RootStackParamList, "Notes">;

const NotesScreen = ({ navigation }: NotesScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const dialog = useAppDialog();
	const { folders, handleDeleteFolder } = useFolders("NOTE");
	const [notes, setNotes] = useState<readonly Note[]>([]);
	const [selectedFolderId, setSelectedFolderId] = useState(FOLDER_FILTER_ALL);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setNotes(await getNotes(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(() => {
		void getScreenData();
	}, [dataVersion, getScreenData]);

	const normalizedSearch = search.trim().toLowerCase();
	const filteredNotes = useMemo(
		() =>
			notes.filter((note) => {
				const matchesFolder =
					selectedFolderId === FOLDER_FILTER_ALL ||
					(selectedFolderId === FOLDER_FILTER_NONE &&
						!note.folderId) ||
					note.folderId === selectedFolderId;
				if (!matchesFolder) {
					return false;
				}
				return `${note.title} ${note.content} ${note.folderName ?? ""}`
					.toLowerCase()
					.includes(normalizedSearch);
			}),
		[normalizedSearch, notes, selectedFolderId],
	);

	const renderNote = useCallback(
		({ item: note }: { item: Note }): React.JSX.Element => (
			<Pressable
				onPress={() =>
					navigation.navigate("NoteForm", {
						noteId: note.id,
					})
				}
			>
				<GlassCard>
					<View style={styles.headingRow}>
						<CustomText style={styles.title}>
							{note.title}
						</CustomText>
						{note.hasAttachment ? (
							<Ionicons
								color={COLORS.primaryBright}
								name="attach"
								size={16}
							/>
						) : null}
					</View>
					{note.folderName ? (
						<CustomText style={styles.folder}>
							{note.folderName}
						</CustomText>
					) : null}
					<CustomText numberOfLines={3} style={styles.content}>
						{note.content || "Empty note"}
					</CustomText>
					<CustomText style={styles.date}>
						Updated {formatDateTime(note.updatedAt)}
					</CustomText>
				</GlassCard>
			</Pressable>
		),
		[navigation],
	);

	const handleDeleteFolderWithConfirm = useCallback(
		(folder: { id: string; name: string }): void => {
			dialog.confirm({
				title: `Delete "${folder.name}"?`,
				message:
					"Folders containing items cannot be deleted. Empty folders will be permanently removed.",
				confirmLabel: "Delete",
				variant: "danger",
				onConfirm: () => {
					const processDelete = async (): Promise<void> => {
						try {
							await handleDeleteFolder(folder.id);
							if (selectedFolderId === folder.id) {
								setSelectedFolderId(FOLDER_FILTER_ALL);
							}
						} catch (caughtError: unknown) {
							setError(getErrorMessage(caughtError));
						}
					};
					void processDelete();
				},
			});
		},
		[dialog, handleDeleteFolder, selectedFolderId],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<FolderFilterChips
					folders={folders}
					onDeleteFolder={handleDeleteFolderWithConfirm}
					onSelectFolder={setSelectedFolderId}
					selectedFolderId={selectedFolderId}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, folders, handleDeleteFolderWithConfirm, selectedFolderId],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="document-text-outline"
				message="Capture a thought, detail or reference."
				title="No notes found"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredNotes}
				keyExtractor={(note) => note.id}
				renderItem={renderNote}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("NoteForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	headingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	title: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "900",
		flex: 1,
	},
	folder: {
		color: COLORS.primaryBright,
		fontSize: 11,
		fontWeight: "800",
		marginTop: 4,
	},
	content: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 19,
		marginTop: 7,
	},
	date: {
		color: COLORS.textDim,
		fontSize: 10,
		marginTop: 9,
	},
});

export { NotesScreen };
