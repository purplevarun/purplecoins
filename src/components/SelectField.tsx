import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { COLORS } from "@/constants/colors";
import type { SelectOption } from "@/types/SelectOption";

type SelectFieldProps = Readonly<{
	label: string;
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
	placeholder?: string;
	isOptional?: boolean;
}>;

const SelectField = ({
	label,
	value,
	options,
	onChange,
	placeholder = "Select",
	isOptional = false,
}: SelectFieldProps): React.JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((option) => option.value === value);
	const handleSelect = (selectedValue: string): void => {
		onChange(selectedValue);
		setIsOpen(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>
			<Pressable onPress={() => setIsOpen(true)} style={styles.trigger}>
				<Text
					numberOfLines={1}
					style={[
						styles.triggerText,
						!selectedOption && styles.placeholder,
					]}
				>
					{selectedOption?.label ?? placeholder}
				</Text>
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
						<Text style={styles.sheetTitle}>{label}</Text>
						<ScrollView>
							{isOptional ? (
								<Pressable
									onPress={() => handleSelect("")}
									style={styles.option}
								>
									<Text style={styles.optionText}>None</Text>
								</Pressable>
							) : null}
							{options.map((option) => (
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
										<Text style={styles.optionText}>
											{option.label}
										</Text>
										{option.description ? (
											<Text style={styles.description}>
												{option.description}
											</Text>
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

const styles = StyleSheet.create({
	container: {
		gap: 7,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	trigger: {
		minHeight: 50,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.045)",
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	triggerText: {
		color: COLORS.text,
		fontSize: 15,
		flex: 1,
	},
	placeholder: {
		color: COLORS.textDim,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.72)",
		justifyContent: "flex-end",
		padding: 16,
	},
	sheet: {
		maxHeight: "72%",
		borderRadius: 24,
		backgroundColor: COLORS.glassStrong,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
		padding: 16,
	},
	sheetTitle: {
		color: COLORS.text,
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 12,
	},
	option: {
		minHeight: 54,
		padding: 12,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	selectedOption: {
		backgroundColor: COLORS.primaryMuted,
	},
	optionContent: {
		flex: 1,
		gap: 3,
	},
	optionText: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "700",
	},
	description: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
});

export { SelectField };
