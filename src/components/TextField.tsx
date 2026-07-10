import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";

type TextFieldProps = Readonly<{
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	placeholder?: string;
	keyboardType?: "default" | "decimal-pad" | "number-pad" | "url";
	isMultiline?: boolean;
	isSecure?: boolean;
	isEditable?: boolean;
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
}>;

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
	inputRow: {
		position: "relative",
	},
	input: {
		minHeight: 50,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.045)",
		color: COLORS.text,
		fontSize: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	inputWithEye: {
		paddingRight: 48,
	},
	multiline: {
		minHeight: 120,
		textAlignVertical: "top",
	},
	disabled: {
		opacity: 0.55,
	},
	eyeButton: {
		position: "absolute",
		right: 14,
		top: 0,
		bottom: 0,
		justifyContent: "center",
	},
});

export default TextField;
