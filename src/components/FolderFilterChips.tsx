import { CustomText } from "@/components/CustomText";
import { CustomTextInput } from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import {
	FOLDER_FILTER_ALL,
	FOLDER_FILTER_NONE,
} from "@/constants/folderConstants";
import type { Folder } from "@/types/Folder";

type FolderFilterChipsProps = Readonly<{
	folders: readonly Folder[];
	selectedFolderId: string;
	onSelectFolder: (folderId: string) => void;
	onDeleteFolder?: (folder: Folder) => void;
	onRenameFolder?: (folder: Folder, newName: string) => void;
}>;

const FolderFilterChips = ({
	folders,
	selectedFolderId,
	onSelectFolder,
	onDeleteFolder,
	onRenameFolder,
}: FolderFilterChipsProps): React.JSX.Element => {
	const [actionFolder, setActionFolder] = useState<Folder | null>(null);
	const [renameMode, setRenameMode] = useState(false);
	const [renameName, setRenameName] = useState("");

	const staticChips = [
		{ id: FOLDER_FILTER_ALL, name: "All" },
		{ id: FOLDER_FILTER_NONE, name: "No folder" },
	] as const;

	const handleLongPress = (folder: Folder): void => {
		setActionFolder(folder);
		setRenameMode(false);
		setRenameName(folder.name);
	};

	const handleClose = (): void => {
		setActionFolder(null);
		setRenameMode(false);
		setRenameName("");
	};

	const handleRenameConfirm = (): void => {
		if (actionFolder && onRenameFolder && renameName.trim()) {
			onRenameFolder(actionFolder, renameName.trim());
		}
		handleClose();
	};

	return (
		<>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.scroller}
			>
				{staticChips.map((folder) => {
					const isSelected = selectedFolderId === folder.id;
					return (
						<Pressable
							key={folder.id}
							onPress={() => onSelectFolder(folder.id)}
							style={[
								styles.chip,
								isSelected && styles.selectedChip,
							]}
						>
							<CustomText
								style={[
									styles.label,
									isSelected && styles.selectedLabel,
								]}
							>
								{folder.name}
							</CustomText>
						</Pressable>
					);
				})}
				{folders.map((folder) => {
					const isSelected = selectedFolderId === folder.id;
					return (
						<Pressable
							key={folder.id}
							onPress={() => onSelectFolder(folder.id)}
							onLongPress={() => handleLongPress(folder)}
							style={[
								styles.chip,
								isSelected && styles.selectedChip,
							]}
						>
							<View style={styles.chipContent}>
								<CustomText
									style={[
										styles.label,
										isSelected && styles.selectedLabel,
									]}
								>
									{folder.name}
								</CustomText>
								{(onDeleteFolder ?? onRenameFolder) ? (
									<Ionicons
										color={
											isSelected
												? COLORS.primaryBright
												: COLORS.textDim
										}
										name="ellipsis-vertical"
										size={10}
									/>
								) : null}
							</View>
						</Pressable>
					);
				})}
			</ScrollView>

			{/* Top-anchored action sheet */}
			<Modal
				animationType="fade"
				onRequestClose={handleClose}
				transparent
				visible={actionFolder !== null}
			>
				<Pressable onPress={handleClose} style={styles.overlay}>
					<Pressable style={styles.sheet}>
						{!renameMode ? (
							<>
								<CustomText style={styles.sheetTitle}>
									{actionFolder?.name}
								</CustomText>
								{onRenameFolder ? (
									<Pressable
										onPress={() => setRenameMode(true)}
										style={styles.actionRow}
									>
										<Ionicons
											color={COLORS.primaryBright}
											name="pencil-outline"
											size={18}
										/>
										<CustomText style={styles.actionLabel}>
											Rename
										</CustomText>
									</Pressable>
								) : null}
								{onDeleteFolder ? (
									<Pressable
										onPress={() => {
											if (actionFolder) {
												onDeleteFolder(actionFolder);
											}
											handleClose();
										}}
										style={styles.actionRow}
									>
										<Ionicons
											color={COLORS.danger}
											name="trash-outline"
											size={18}
										/>
										<CustomText
											style={[
												styles.actionLabel,
												{ color: COLORS.danger },
											]}
										>
											Delete
										</CustomText>
									</Pressable>
								) : null}
							</>
						) : (
							<>
								<CustomText style={styles.sheetTitle}>
									Rename folder
								</CustomText>
								<CustomTextInput
									autoFocus
									onChangeText={setRenameName}
									placeholder="Folder name"
									style={styles.renameInput}
									value={renameName}
								/>
								<View style={styles.renameActions}>
									<AppButton
										isCompact
										label="Cancel"
										onPress={handleClose}
										variant="secondary"
									/>
									<AppButton
										isCompact
										label="Save"
										onPress={handleRenameConfirm}
									/>
								</View>
							</>
						)}
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	scroller: {
		marginHorizontal: -2,
	},
	chip: {
		marginHorizontal: 2,
		paddingHorizontal: 12,
		paddingVertical: 9,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.045)",
	},
	selectedChip: {
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.primaryMuted,
	},
	chipContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "800",
	},
	selectedLabel: {
		color: COLORS.primaryBright,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.72)",
		justifyContent: "flex-start",
		padding: 16,
		paddingTop: 56,
	},
	sheet: {
		borderRadius: 24,
		backgroundColor: COLORS.glassStrong,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
		padding: 18,
		gap: 4,
	},
	sheetTitle: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "800",
		marginBottom: 10,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
		paddingVertical: 14,
		paddingHorizontal: 4,
		borderRadius: 12,
	},
	actionLabel: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "700",
	},
	renameInput: {
		backgroundColor: "rgba(255,255,255,0.06)",
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: COLORS.text,
		fontSize: 15,
		marginBottom: 12,
	},
	renameActions: {
		flexDirection: "row",
		gap: 8,
		justifyContent: "flex-end",
	},
});

export { FolderFilterChips };
