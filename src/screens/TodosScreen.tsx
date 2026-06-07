import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { getTodos, toggleTodo } from "@/services/todoService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { Todo } from "@/types/Todo";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";

type TodosScreenProps = NativeStackScreenProps<RootStackParamList, "Todos">;

const TodosScreen = ({ navigation }: TodosScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const [todos, setTodos] = useState<readonly Todo[]>([]);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTodos(await getTodos(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
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

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error],
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
				data={todos}
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
});

export { TodosScreen };
