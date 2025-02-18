import { useRef } from "react";
import { DimensionValue, Text, TextInput, View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import {
	ABSOLUTE,
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FONT_SIZE,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
	UBUNTU_FONT,
} from "./constants.config";

const CustomInput = ({
	value,
	setValue,
	name,
	numeric = false,
	password = false,
	disabled = false,
	width = "90%",
	bottom = 0,
	autoFocus = false,
}: {
	value: string;
	setValue?: (_: string) => void;
	name: string;
	numeric?: boolean;
	password?: boolean;
	disabled?: boolean;
	required?: boolean;
	width?: DimensionValue;
	bottom?: DimensionValue;
	autoFocus?: boolean;
}) => {
	const inputRef = useRef<TextInput>(null);

	return (
		<View
			style={{
				paddingTop: PADDING_TOP_ADD_SCREEN,
				alignSelf: CENTER,
				width,
				marginBottom: bottom,
			}}
		>
			{value.length === 0 && (
				<Text
					style={{
						color: DISABLED_COLOR,
						fontFamily: UBUNTU_FONT,
						position: ABSOLUTE,
						left: PADDING,
						top: FONT_SIZE,
						fontSize: FONT_SIZE,
					}}
				>
					{name}
				</Text>
			)}
			<TextInput
				autoFocus={autoFocus}
				ref={inputRef}
				value={value}
				onChangeText={setValue}
				autoComplete={"off"}
				autoCorrect={false}
				style={{
					height: FONT_SIZE * 2.5,
					borderWidth: BORDER_WIDTH,
					borderRadius: BORDER_RADIUS,
					padding: PADDING,
					borderColor: PRIMARY_COLOR,
					color: disabled ? DISABLED_COLOR : PRIMARY_COLOR,
					fontFamily: UBUNTU_FONT,
					fontSize: FONT_SIZE,
				}}
				keyboardType={numeric ? "decimal-pad" : "default"}
				secureTextEntry={password}
				readOnly={disabled}
			/>
		</View>
	);
};

export default CustomInput;
