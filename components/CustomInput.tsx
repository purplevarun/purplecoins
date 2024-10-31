import { Animated, Easing, TextInput, View } from "react-native";
import {
	ABSOLUTE,
	CENTER,
	FONT_SIZE,
	PADDING_TOP_ADD_SCREEN,
	UBUNTU_FONT,
	WIDTH_90,
} from "../config/constants.config";
import { FC, useEffect, useRef, useState } from "react";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../config/colors.config";
import { BORDER_RADIUS, PADDING } from "../config/constants.config";

interface Input {
	value: string;
	setValue?: (_: string) => void;
	name: string;
	numeric?: boolean;
	password?: boolean;
	disabled?: boolean;
}

const CustomInput: FC<Input> = ({
	value,
	setValue,
	name,
	numeric = false,
	password = false,
	disabled = false,
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
				width: WIDTH_90,
				alignSelf: CENTER,
			}}
		>
			<Animated.Text
				style={{
					position: ABSOLUTE,
					left: PADDING,
					top: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE, 0],
					}),
					fontSize: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE, FONT_SIZE / 1.5],
					}),
					color: DISABLED_COLOR,
					backgroundColor: BACKGROUND_COLOR,
					zIndex: 1,
					fontFamily: UBUNTU_FONT,
				}}
				onPress={() => inputRef.current?.focus()}
			>
				{` ${name} `}
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
				keyboardType={numeric ? "number-pad" : "default"}
				secureTextEntry={password}
				readOnly={disabled}
			/>
		</View>
	);
};

export default CustomInput;
