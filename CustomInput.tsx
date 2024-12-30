import { Animated, Easing, TextInput, View } from "react-native";
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
import { useEffect, useRef, useState } from "react";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";

const CustomInput = ({
	value,
	setValue,
	name,
	numeric = false,
	password = false,
	disabled = false,
}: {
	value: string;
	setValue?: (_: string) => void;
	name: string;
	numeric?: boolean;
	password?: boolean;
	disabled?: boolean;
	required?: boolean;
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
				width: NINETY_P,
				alignSelf: CENTER,
			}}
		>
			<Animated.Text
				style={{
					position: ABSOLUTE,
					left: PADDING,
					top: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE, -2],
					}),
					fontSize: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE, FONT_SIZE / 1.5],
					}),
					color: DISABLED_COLOR,
					backgroundColor: BACKGROUND_COLOR,
					zIndex: 1,
					fontFamily: UBUNTU_FONT,
					paddingHorizontal: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 3],
					}),
				}}
				onPress={() => inputRef.current?.focus()}
			>
				{name}
			</Animated.Text>

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
