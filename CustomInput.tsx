import { useEffect, useRef, useState } from "react";
import {
	Animated,
	DimensionValue,
	Easing,
	Text,
	TextInput,
	View,
} from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import {
	ABSOLUTE,
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	NINETY_P,
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
	width = NINETY_P,
}: {
	value: string;
	setValue?: (_: string) => void;
	name: string;
	numeric?: boolean;
	password?: boolean;
	disabled?: boolean;
	required?: boolean;
	width?: DimensionValue;
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isFocused || value ? 1 : 0,
			duration: 200,
			easing: Easing.linear,
			useNativeDriver: false,
		}).start();
	}, [isFocused, value]);

	const inputRef = useRef<TextInput>(null);

	return (
		<View
			style={{
				paddingTop: PADDING_TOP_ADD_SCREEN,
				width,
				alignSelf: CENTER,
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
				ref={inputRef}
				value={value}
				onChangeText={setValue}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				autoComplete={"off"}
				autoCorrect={false}
				style={{
					height: FONT_SIZE * 2.5,
					borderWidth: 2,
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
