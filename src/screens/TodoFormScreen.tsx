import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";

import AppButton from "@/components/AppButton";
import AttachmentField from "@/components/AttachmentField";
import DateField from "@/components/DateField";
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
import todoService from "@/services/todoService";
import type RootStackParamList from "@/types/RootStackParamList";
import getErrorMessage from "@/utils/error";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
const { deleteTodo, getTodo, saveTodo } = todoService;

type TodoFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"TodoForm"
>;

const TodoFormScreen = ({
	navigation,
	route,
}: TodoFormScreenProps): React.JSX.Element => {
	const todoId = route.params?.todoId;
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { folders, handleCreateFolder } = useFolders("TODO");
	const attachment = useAttachment("TODO", todoId);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [folderId, setFolderId] = useState("");
	const [isDone, setIsDone] = useState(false);
	const [hasDueDate, setHasDueDate] = useState(false);
	const [dueAt, setDueAt] = useState(() => Date.now());
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getExistingTodo = async (): Promise<void> => {
			if (!todoId) {
				return;
			}
			try {
				const todo = await getTodo(database, todoId);
				if (todo) {
					setTitle(todo.title);
					setDescription(todo.description);
					setFolderId(todo.folderId ?? "");
					setIsDone(todo.isDone);
					setHasDueDate(todo.dueAt !== null);
					setDueAt(todo.dueAt ?? Date.now());
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getExistingTodo();
	}, [database, todoId]);

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			const savedId = await saveTodo(database, {
				id: todoId,
				title,
				description,
				folderId: folderId || undefined,
				dueAt: hasDueDate ? dueAt : undefined,
				isDone,
			});
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
		if (!todoId) {
			return;
		}
		dialog.confirm({
			title: "Delete todo?",
			message: "This action cannot be undone.",
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: () => {
				const processDelete = async (): Promise<void> => {
					try {
						await deleteTodo(database, todoId);
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
						{todoId ? "Edit todo" : "New todo"}
					</CustomText>
					<TextField
						label="Title"
						onChangeText={setTitle}
						placeholder="What needs doing?"
						value={title}
					/>
					<TextField
						isMultiline
						label="Description"
						onChangeText={setDescription}
						placeholder="Optional details"
						value={description}
					/>
					<FolderPicker
						folders={folders}
						onChange={setFolderId}
						onCreateFolder={handleCreateFolder}
						value={folderId}
					/>
					<View style={styles.switchRow}>
						<CustomText style={styles.switchLabel}>
							Due date
						</CustomText>
						<Switch
							onValueChange={setHasDueDate}
							value={hasDueDate}
						/>
					</View>
					{hasDueDate ? (
						<DateField
							label="Due"
							onChange={setDueAt}
							value={dueAt}
						/>
					) : null}
					<View style={styles.switchRow}>
						<CustomText style={styles.switchLabel}>
							Completed
						</CustomText>
						<Switch onValueChange={setIsDone} value={isDone} />
					</View>
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
						label="Save todo"
						onPress={() => void handleSave()}
					/>
					{todoId ? (
						<AppButton
							label="Delete todo"
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
	switchRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	switchLabel: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "800",
	},
});

export default TodoFormScreen;
