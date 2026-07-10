import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import AttachmentField from "@/components/AttachmentField";
import FolderPicker from "@/components/FolderPicker";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useAttachment from "@/hooks/useAttachment";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import useFolders from "@/hooks/useFolders";
import noteService from "@/services/noteService";
import type RootStackParamList from "@/types/RootStackParamList";
import getErrorMessage from "@/utils/error";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
const { deleteNote, getNote, saveNote } = noteService;

type NoteFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"NoteForm"
>;

const NoteFormScreen = ({
	navigation,
	route,
}: NoteFormScreenProps): React.JSX.Element => {
	const noteId = route.params?.noteId;
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { folders, handleCreateFolder } = useFolders("NOTE");
	const attachment = useAttachment("NOTE", noteId);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [folderId, setFolderId] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getExistingNote = async (): Promise<void> => {
			if (!noteId) {
				return;
			}
			try {
				const note = await getNote(database, noteId);
				if (note) {
					setTitle(note.title);
					setContent(note.content);
					setFolderId(note.folderId ?? "");
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getExistingNote();
	}, [database, noteId]);

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			const savedId = await saveNote(
				database,
				noteId,
				title,
				content,
				folderId || undefined,
			);
			await attachment.processAttachment(savedId);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = (): void => {
		if (!noteId) {
			return;
		}
		dialog.confirm({
			title: "Delete note?",
			message: "This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: () => {
				const processDelete = async (): Promise<void> => {
					try {
						await deleteNote(database, noteId);
						refreshData();
						navigation.goBack();
					} catch (caughtError: unknown) {
						setError(getErrorMessage(caughtError));
					}
				};
				void processDelete();
			},
		});
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{noteId ? "Edit note" : "New note"}
					</CustomText>
					<TextField
						label="Title"
						onChangeText={setTitle}
						placeholder="Note title"
						value={title}
					/>
					<TextField
						isMultiline
						label="Content"
						onChangeText={setContent}
						placeholder="Write something useful..."
						value={content}
					/>
					<FolderPicker
						folders={folders}
						onChange={setFolderId}
						onCreateFolder={handleCreateFolder}
						value={folderId}
					/>
					<AttachmentField
						existingAttachment={attachment.existingAttachment}
						isRemoved={attachment.isRemoved}
						onOpen={() => void attachment.handleOpen()}
						onPick={() => void attachment.handlePick()}
						onRemove={attachment.handleRemove}
						pendingAttachment={attachment.pendingAttachment}
					/>
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isLoading={isSaving}
						label="Save note"
						onPress={() => void handleSave()}
					/>
					{noteId ? (
						<AppButton
							label="Delete note"
							onPress={handleDelete}
							variant="danger"
						/>
					) : null}
				</View>
			</GlassCard>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	form: {
		gap: 16,
	},
	heading: {
		color: COLORS.text,
		fontSize: 24,
		fontWeight: "900",
	},
});

export default NoteFormScreen;
