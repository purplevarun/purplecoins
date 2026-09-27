import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type SelectFieldProps from "@/types/SelectFieldProps";

const SelectField = ({
	label,
	value,
	options,
	onChange,
	placeholder = "Select",
	isOptional = false,
}: SelectFieldProps): React.JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const selectedOption = options.find((option) => option.value === value);

	const filteredOptions = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return options;
		return options.filter(
			(o) =>
				o.label.toLowerCase().includes(q) ||
				(o.description ?? "").toLowerCase().includes(q),
		);
	}, [options, search]);

	const handleOpen = (): void => {
		setSearch("");
		setIsOpen(true);
	};

	const handleSelect = (selectedValue: string): void => {
		onChange(selectedValue);
		setIsOpen(false);
		setSearch("");
	};

	return (
		<View style={styles.container}>
			<CustomText style={styles.label}>{label}</CustomText>
			<Pressable onPress={handleOpen} style={styles.trigger}>
				<CustomText
					numberOfLines={1}
					style={[
						styles.triggerText,
						!selectedOption && styles.placeholder,
					]}
				>
					{selectedOption?.label ?? placeholder}
				</CustomText>
				<Ionicons
					color={COLORS.textMuted}
					name="chevron-down"
					size={18}
				/>
			</Pressable>
			<Modal
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
				transparent
				visible={isOpen}
			>
				<Pressable
					onPress={() => setIsOpen(false)}
					style={styles.overlay}
				>
					<Pressable style={styles.sheet}>
						<CustomText style={styles.sheetTitle}>
							{label}
						</CustomText>
						<CustomTextInput
							autoFocus
							onChangeText={setSearch}
							placeholder="Search..."
							style={styles.searchInput}
							value={search}
						/>
						<ScrollView keyboardShouldPersistTaps="handled">
							{isOptional ? (
								<Pressable
									onPress={() => handleSelect("")}
									style={styles.option}
								>
									<CustomText style={styles.optionText}>
										None
									</CustomText>
								</Pressable>
							) : null}
							{filteredOptions.length === 0 ? (
								<CustomText style={styles.noResults}>
									{`No results for "${search}"`}
								</CustomText>
							) : null}
							{filteredOptions.map((option) => (
								<Pressable
									key={option.value}
									onPress={() => handleSelect(option.value)}
									style={[
										styles.option,
										option.value === value &&
											styles.selectedOption,
									]}
								>
									<View style={styles.optionContent}>
										<CustomText style={styles.optionText}>
											{option.label}
										</CustomText>
										{option.description ? (
											<CustomText
												style={styles.description}
											>
												{option.description}
											</CustomText>
										) : null}
									</View>
									{option.value === value ? (
										<Ionicons
											color={COLORS.primaryBright}
											name="checkmark-circle"
											size={20}
										/>
									) : null}
								</Pressable>
							))}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
};

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	RADIUS,
	SIZES,
	SPACING,
	TEXT_TRANSFORM,
} = styleConstants;

const styles = StyleSheet.create({
	container: {
		gap: SPACING.S7,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.BOLD,
		textTransform: TEXT_TRANSFORM.UPPERCASE,
		letterSpacing: LETTER_SPACING.WIDEST,
	},
	trigger: {
		minHeight: SIZES.S50,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S15,
		backgroundColor: COLORS.surfaceLight,
		paddingHorizontal: SPACING.S14,
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.SPACE_BETWEEN,
		gap: SPACING.S8,
	},
	triggerText: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		flex: FLEX.FILL,
	},
	placeholder: {
		color: COLORS.textDim,
	},
	overlay: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.overlayStrong,
		justifyContent: ALIGN.START,
		padding: SPACING.S16,
		paddingTop: SPACING.S56,
	},
	sheet: {
		maxHeight: SIZES.SHEET,
		borderRadius: RADIUS.S24,
		backgroundColor: COLORS.glassStrong,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.borderStrong,
		padding: SPACING.S16,
	},
	sheetTitle: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S20,
		fontWeight: FONT_WEIGHT.HEAVY,
		marginBottom: SPACING.S12,
	},
	searchInput: {
		backgroundColor: COLORS.surfaceHigh,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S12,
		paddingHorizontal: SPACING.S12,
		paddingVertical: SPACING.S10,
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		marginBottom: SPACING.S8,
	},
	noResults: {
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S13,
		padding: SPACING.S12,
		textAlign: ALIGN.CENTER,
	},
	option: {
		minHeight: SIZES.S54,
		padding: SPACING.S12,
		borderRadius: RADIUS.S14,
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.SPACE_BETWEEN,
		gap: SPACING.S8,
	},
	selectedOption: {
		backgroundColor: COLORS.primaryMuted,
	},
	optionContent: {
		flex: FLEX.FILL,
		gap: SPACING.S3,
	},
	optionText: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		fontWeight: FONT_WEIGHT.BOLD,
	},
	description: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
	},
});

export default SelectField;
