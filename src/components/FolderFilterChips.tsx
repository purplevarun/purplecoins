import { CustomText } from "@/components/CustomText";
import { Pressable, ScrollView, StyleSheet } from "react-native";

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
}>;

const FolderFilterChips = ({
	folders,
	selectedFolderId,
	onSelectFolder,
}: FolderFilterChipsProps): React.JSX.Element => {
	const chips = [
		{ id: FOLDER_FILTER_ALL, name: "All" },
		{ id: FOLDER_FILTER_NONE, name: "No folder" },
		...folders,
	] as const;

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.scroller}
		>
			{chips.map((folder) => {
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
