import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { getNotes } from "@/services/noteService";
import type { Note } from "@/types/Note";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { formatDateTime } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";

type NotesScreenProps = NativeStackScreenProps<RootStackParamList, "Notes">;

const NotesScreen = ({ navigation }: NotesScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [notes, setNotes] = useState<readonly Note[]>([]);
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

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const normalizedSearch = search.trim().toLowerCase();
	const filteredNotes = notes.filter((note) =>
		`${note.title} ${note.content} ${note.folderName ?? ""}`
			.toLowerCase()
			.includes(normalizedSearch),
	);

	return (
		<View style={styles.screen}>
			<ScreenContainer>
				<TextField
					label="Search"
					onChangeText={setSearch}
					placeholder="Title, content or folder"
					value={search}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
				{filteredNotes.length === 0 ? (
					<EmptyState
						icon="document-text-outline"
						message="Capture a thought, detail or reference."
						title="No notes found"
					/>
				) : null}
				{filteredNotes.map((note) => (
					<Pressable
						key={note.id}
						onPress={() =>
							navigation.navigate("NoteForm", {
								noteId: note.id,
							})
						}
					>
						<GlassCard>
							<View style={styles.headingRow}>
								<Text style={styles.title}>{note.title}</Text>
								{note.hasAttachment ? (
									<Ionicons
										color={COLORS.primaryBright}
										name="attach"
										size={16}
									/>
								) : null}
							</View>
							{note.folderName ? (
								<Text style={styles.folder}>
									{note.folderName}
								</Text>
							) : null}
							<Text numberOfLines={3} style={styles.content}>
								{note.content || "Empty note"}
							</Text>
							<Text style={styles.date}>
								Updated {formatDateTime(note.updatedAt)}
							</Text>
						</GlassCard>
					</Pressable>
				))}
			</ScreenContainer>
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
