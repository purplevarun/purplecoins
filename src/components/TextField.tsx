import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "@/constants/colors";

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
}: TextFieldProps): React.JSX.Element => (
	<View style={styles.container}>
		<Text style={styles.label}>{label}</Text>
		<TextInput
			autoCapitalize={autoCapitalize}
			editable={isEditable}
			keyboardType={keyboardType}
			multiline={isMultiline}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor={COLORS.textDim}
			secureTextEntry={isSecure}
			style={[
				styles.input,
				isMultiline && styles.multiline,
				!isEditable && styles.disabled,
			]}
			value={value}
		/>
	</View>
);

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
	multiline: {
		minHeight: 120,
		textAlignVertical: "top",
	},
	disabled: {
		opacity: 0.55,
	},
});

export { TextField };
