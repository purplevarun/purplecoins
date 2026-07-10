import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import FolderFilterChips from "@/components/FolderFilterChips";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import COLORS from "@/constants/colors";
import folderConstants from "@/constants/folderConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import useFolders from "@/hooks/useFolders";
import todoService from "@/services/todoService";
import type RootStackParamList from "@/types/RootStackParamList";
import type Todo from "@/types/Todo";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import runAfterRender from "@/utils/runAfterRender";
const { FOLDER_FILTER_ALL, FOLDER_FILTER_NONE } = folderConstants;
const { getTodos, toggleTodo } = todoService;
const { formatDate } = dateUtils;

type TodosScreenProps = NativeStackScreenProps<RootStackParamList, "Todos">;

const TodosScreen = ({ navigation }: TodosScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { folders, handleDeleteFolder, handleRenameFolder } =
		useFolders("TODO");
	const [todos, setTodos] = useState<readonly Todo[]>([]);
	const [selectedFolderId, setSelectedFolderId] = useState(FOLDER_FILTER_ALL);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTodos(await getTodos(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const handleToggle = useCallback(
		async (id: string): Promise<void> => {
			try {
				await toggleTodo(database, id);
				refreshData();
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		},
		[database, refreshData],
	);

	const renderTodo = useCallback(
		({ item: todo }: { item: Todo }): React.JSX.Element => (
			<Pressable
				onPress={() =>
					navigation.navigate("TodoForm", {
						todoId: todo.id,
					})
				}
			>
				<GlassCard accent={todo.isDone ? "success" : "default"}>
					<View style={styles.row}>
						<Pressable
							onPress={() => void handleToggle(todo.id)}
							style={styles.checkbox}
						>
							<Ionicons
								color={
									todo.isDone
										? COLORS.success
										: COLORS.textMuted
								}
								name={
									todo.isDone
										? "checkmark-circle"
										: "ellipse-outline"
								}
								size={27}
							/>
						</Pressable>
						<View style={styles.details}>
							<View style={styles.headingRow}>
								<CustomText
									style={[
										styles.title,
										todo.isDone && styles.completedTitle,
									]}
								>
									{todo.title}
								</CustomText>
								{todo.hasAttachment ? (
									<Ionicons
										color={COLORS.primaryBright}
										name="attach"
										size={15}
									/>
								) : null}
							</View>
							{todo.description ? (
								<CustomText
									numberOfLines={2}
									style={styles.description}
								>
									{todo.description}
								</CustomText>
							) : null}
							<CustomText style={styles.meta}>
								{todo.folderName ?? "No folder"}
								{todo.dueAt
									? ` · Due ${formatDate(todo.dueAt)}`
									: ""}
							</CustomText>
						</View>
					</View>
				</GlassCard>
			</Pressable>
		),
		[handleToggle, navigation],
	);

	const filteredTodos = useMemo(
		() =>
			todos.filter((todo) => {
				if (selectedFolderId === FOLDER_FILTER_ALL) {
					return true;
				}
				if (selectedFolderId === FOLDER_FILTER_NONE) {
					return !todo.folderId;
				}
				return todo.folderId === selectedFolderId;
			}),
		[selectedFolderId, todos],
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

	const handleRenameFolderWithModal = useCallback(
		(folder: { id: string; name: string }, newName: string): void => {
			const processRename = async (): Promise<void> => {
				try {
					await handleRenameFolder(folder.id, newName);
				} catch (caughtError: unknown) {
					setError(getErrorMessage(caughtError));
				}
			};
			void processRename();
		},
		[handleRenameFolder],
	);

	// Top-4 folders by todo count for quick chips
	const topFolderChips = useMemo(() => {
		const countMap = new Map<string, number>();
		for (const todo of todos) {
			if (todo.folderId) {
				countMap.set(
					todo.folderId,
					(countMap.get(todo.folderId) ?? 0) + 1,
				);
			}
		}
		return [...folders]
			.sort(
				(a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
			)
			.slice(0, 4);
	}, [folders, todos]);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<FolderFilterChips
					folders={folders}
					onDeleteFolder={handleDeleteFolderWithConfirm}
					onRenameFolder={handleRenameFolderWithModal}
					onSelectFolder={setSelectedFolderId}
					selectedFolderId={selectedFolderId}
				/>
				{topFolderChips.length > 0 ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.quickChipsRow}
					>
						{topFolderChips.map((folder) => {
							const isSelected = selectedFolderId === folder.id;
							return (
								<Pressable
									key={folder.id}
									onPress={() =>
										setSelectedFolderId(folder.id)
									}
									style={[
										styles.quickChip,
										isSelected && styles.quickChipSelected,
									]}
								>
									<CustomText
										style={[
											styles.quickChipLabel,
											isSelected &&
												styles.quickChipLabelSelected,
										]}
									>
										{folder.name}
									</CustomText>
								</Pressable>
							);
						})}
					</ScrollView>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[
			error,
			folders,
			handleDeleteFolderWithConfirm,
			handleRenameFolderWithModal,
			selectedFolderId,
			topFolderChips,
		],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="checkbox-outline"
				message="Add something you need to remember."
				title="No todos yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredTodos}
				extraData={dataVersion}
				keyExtractor={(todo) => todo.id}
				renderItem={renderTodo}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("TodoForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
	},
	checkbox: {
		padding: 2,
	},
	details: {
		flex: 1,
		gap: 4,
	},
	headingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	title: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	completedTitle: {
		color: COLORS.textMuted,
		textDecorationLine: "line-through",
	},
	description: {
		color: COLORS.textMuted,
		fontSize: 12,
		lineHeight: 17,
	},
	meta: {
		color: COLORS.textDim,
		fontSize: 10,
	},
	quickChipsRow: {
		marginTop: 6,
		marginHorizontal: -2,
	},
	quickChip: {
		marginHorizontal: 2,
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.03)",
	},
	quickChipSelected: {
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.primaryMuted,
	},
	quickChipLabel: {
		color: COLORS.textDim,
		fontSize: 11,
		fontWeight: "700",
	},
	quickChipLabelSelected: {
		color: COLORS.primaryBright,
	},
});

export default TodosScreen;
