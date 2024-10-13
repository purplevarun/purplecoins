import {
	Animated,
	Easing,
	KeyboardTypeOptions,
	TextInput,
	View,
} from "react-native";
import { FONT_SIZE } from "../config/dimensions.config";
import { FC, useEffect, useRef, useState } from "react";
import {
	backgroundColor,
	disabledColor,
	primaryColor,
} from "../config/colors.config";
import { borderRadius, padding } from "../config/style.config";

interface Input {
	value: string;
	setValue: (_: string) => void;
	name: string;
	type?: KeyboardTypeOptions;
}

const ComponentInput: FC<Input> = ({
	value,
	setValue,
	name,
	type = "default",
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
				paddingTop: FONT_SIZE * 0.8,
				width: "90%",
				alignSelf: "center",
			}}
		>
			<Animated.Text
				style={{
					position: "absolute",
					left: padding,
					top: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE * 1.4, FONT_SIZE / 3],
					}),
					fontSize: animatedValue.interpolate({
						inputRange: [0, 1],
						outputRange: [FONT_SIZE, FONT_SIZE / 1.5],
					}),
					color: disabledColor,
					backgroundColor: backgroundColor,
					zIndex: 1,
					fontFamily: "Ubuntu",
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
				autoComplete="off"
				autoCorrect={false}
				style={{
					width: "100%",
					height: FONT_SIZE * 2.5,
					borderWidth: 2,
					borderRadius,
					padding,
					borderColor: primaryColor,
					color: primaryColor,
					fontFamily: "Ubuntu",
					fontSize: FONT_SIZE,
				}}
				keyboardType={type}
			/>
		</View>
	);
};

export default ComponentInput;
