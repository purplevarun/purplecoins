import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import CustomTextInput from "@/components/CustomTextInput";
import COLORS from "@/constants/colors";
import folderConstants from "@/constants/folderConstants";
import styleConstants from "@/constants/styleConstants";
import type Folder from "@/types/Folder";
import type FolderFilterChipsProps from "@/types/FolderFilterChipsProps";
const { FOLDER_FILTER_ALL, FOLDER_FILTER_NONE } = folderConstants;

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

const { ALIGN, BORDER, FLEX, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } =
	styleConstants;

const styles = StyleSheet.create({
	scroller: {
		marginHorizontal: SPACING.N2,
	},
	chip: {
		marginHorizontal: SPACING.S2,
		paddingHorizontal: SPACING.S12,
		paddingVertical: SPACING.S9,
		borderRadius: RADIUS.PILL,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceLight,
	},
	selectedChip: {
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.primaryMuted,
	},
	chipContent: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S4,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.HEAVY,
	},
	selectedLabel: {
		color: COLORS.primaryBright,
	},
	overlay: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.overlayStrong,
		justifyContent: ALIGN.START,
		padding: SPACING.S16,
		paddingTop: SPACING.S56,
	},
	sheet: {
		borderRadius: RADIUS.S24,
		backgroundColor: COLORS.glassStrong,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.borderStrong,
		padding: SPACING.S18,
		gap: SPACING.S4,
	},
	sheetTitle: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S18,
		fontWeight: FONT_WEIGHT.HEAVY,
		marginBottom: SPACING.S10,
	},
	actionRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S14,
		paddingVertical: SPACING.S14,
		paddingHorizontal: SPACING.S4,
		borderRadius: RADIUS.S12,
	},
	actionLabel: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		fontWeight: FONT_WEIGHT.BOLD,
	},
	renameInput: {
		backgroundColor: COLORS.surfaceHigh,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S12,
		paddingHorizontal: SPACING.S12,
		paddingVertical: SPACING.S10,
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		marginBottom: SPACING.S12,
	},
	renameActions: {
		flexDirection: FLEX.ROW,
		gap: SPACING.S8,
		justifyContent: ALIGN.END,
	},
});

export default FolderFilterChips;
