import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

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
}>;

const FolderFilterChips = ({
	folders,
	selectedFolderId,
	onSelectFolder,
	onDeleteFolder,
}: FolderFilterChipsProps): React.JSX.Element => {
	const staticChips = [
		{ id: FOLDER_FILTER_ALL, name: "All" },
		{ id: FOLDER_FILTER_NONE, name: "No folder" },
	] as const;

	return (
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
						style={[styles.chip, isSelected && styles.selectedChip]}
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
						onLongPress={() => onDeleteFolder?.(folder)}
						style={[styles.chip, isSelected && styles.selectedChip]}
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
							{onDeleteFolder ? (
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
});

export { FolderFilterChips };
