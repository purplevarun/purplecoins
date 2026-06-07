import { CustomText } from "@/components/CustomText";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import type { Folder } from "@/types/Folder";
import type { SelectOption } from "@/types/SelectOption";

type FolderPickerProps = Readonly<{
	value: string;
	folders: readonly Folder[];
	onChange: (value: string) => void;
	onCreateFolder: (name: string) => Promise<string>;
}>;

const FolderPicker = ({
	value,
	folders,
	onChange,
	onCreateFolder,
}: FolderPickerProps): React.JSX.Element => {
	const [isCreating, setIsCreating] = useState(false);
	const [folderName, setFolderName] = useState("");
	const options: readonly SelectOption[] = folders.map((folder) => ({
		label: folder.name,
		value: folder.id,
	}));

	const handleCreate = async (): Promise<void> => {
		const id = await onCreateFolder(folderName);
		onChange(id);
		setFolderName("");
		setIsCreating(false);
	};

	return (
		<View style={styles.container}>
			<SelectField
				isOptional
				label="Folder"
				onChange={onChange}
				options={options}
				placeholder="No folder"
				value={value}
			/>
			{isCreating ? (
				<View style={styles.creator}>
					<TextField
						label="New folder"
						onChangeText={setFolderName}
						placeholder="Folder name"
						value={folderName}
					/>
					<View style={styles.actions}>
						<AppButton
							isCompact
							label="Cancel"
							onPress={() => setIsCreating(false)}
							variant="secondary"
						/>
						<AppButton
							isCompact
							label="Create"
							onPress={() => void handleCreate()}
						/>
					</View>
				</View>
			) : (
				<AppButton
					icon="folder-open-outline"
					isCompact
					label="New folder"
					onPress={() => setIsCreating(true)}
					variant="secondary"
				/>
			)}
			<CustomText style={styles.hint}>
				Folders with linked items cannot be deleted.
			</CustomText>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 9,
	},
	creator: {
		gap: 9,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	hint: {
		color: COLORS.textDim,
		fontSize: 11,
	},
});

export { FolderPicker };
