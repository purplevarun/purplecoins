import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type TextFieldProps from "@/types/TextFieldProps";

const TextField = ({
	label,
	value,
	onChangeText,
	placeholder,
	keyboardType = "default",
	isMultiline = false,
	isSecure = false,
	isEditable = true,
	autoCapitalize = "sentences",
}: TextFieldProps): React.JSX.Element => {
	const [showSecret, setShowSecret] = useState(false);

	return (
		<View style={styles.container}>
			<CustomText style={styles.label}>{label}</CustomText>
			<View style={styles.inputRow}>
				<CustomTextInput
					autoCapitalize={autoCapitalize}
					editable={isEditable}
					keyboardType={keyboardType}
					multiline={isMultiline}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={COLORS.textDim}
					secureTextEntry={isSecure && !showSecret}
					style={[
						styles.input,
						isMultiline && styles.multiline,
						!isEditable && styles.disabled,
						isSecure && styles.inputWithEye,
					]}
					value={value}
				/>
				{isSecure ? (
					<Pressable
						onPress={() => setShowSecret((s) => !s)}
						style={styles.eyeButton}
					>
						<Ionicons
							color={COLORS.textMuted}
							name={
								showSecret ? "eye-off-outline" : "eye-outline"
							}
							size={20}
						/>
					</Pressable>
				) : null}
			</View>
		</View>
	);
};

const {
	ALIGN,
	BORDER,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	OPACITY,
	POSITION,
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
	inputRow: {
		position: POSITION.RELATIVE,
	},
	input: {
		minHeight: SIZES.S50,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S15,
		backgroundColor: COLORS.surfaceLight,
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		paddingHorizontal: SPACING.S14,
		paddingVertical: SPACING.S12,
	},
	inputWithEye: {
		paddingRight: SPACING.S48,
	},
	multiline: {
		minHeight: SIZES.S120,
		textAlignVertical: ALIGN.TOP,
	},
	disabled: {
		opacity: OPACITY.MUTED,
	},
	eyeButton: {
		position: POSITION.ABSOLUTE,
		right: SPACING.S14,
		top: SPACING.S0,
		bottom: SPACING.S0,
		justifyContent: ALIGN.CENTER,
	},
});

export default TextField;
