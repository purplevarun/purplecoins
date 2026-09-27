import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import styleConstants from "@/constants/styleConstants";
import type InvestmentTypePickerProps from "@/types/InvestmentTypePickerProps";
import type SelectOption from "@/types/SelectOption";

const InvestmentTypePicker = ({
	value,
	investmentTypes,
	onChange,
	onCreateInvestmentType,
}: InvestmentTypePickerProps): React.JSX.Element => {
	const [isCreating, setIsCreating] = useState(false);
	const [typeName, setTypeName] = useState("");
	const options: readonly SelectOption[] = investmentTypes.map((type) => ({
		label: type.name,
		value: type.id,
	}));

	const handleCreate = async (): Promise<void> => {
		const id = await onCreateInvestmentType(typeName);
		onChange(id);
		setTypeName("");
		setIsCreating(false);
	};

	return (
		<View style={styles.container}>
			<SelectField
				isOptional
				label="Investment type"
				onChange={onChange}
				options={options}
				placeholder="No type"
				value={value}
			/>
			{isCreating ? (
				<View style={styles.creator}>
					<TextField
						label="New investment type"
						onChangeText={setTypeName}
						placeholder="Type name"
						value={typeName}
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
					icon="pricetags-outline"
					isCompact
					label="New investment type"
					onPress={() => setIsCreating(true)}
					variant="secondary"
				/>
			)}
		</View>
	);
};

const { ALIGN, FLEX, SPACING } = styleConstants;

const styles = StyleSheet.create({
	container: {
		gap: SPACING.S9,
	},
	creator: {
		gap: SPACING.S9,
	},
	actions: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.END,
		gap: SPACING.S8,
	},
});

export default InvestmentTypePicker;
