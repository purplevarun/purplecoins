import {
	Animated,
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { borderRadius, padding } from "../config/style.config";
import ComponentText from "./Component.Text";
import { FC, useRef } from "react";

type Button = {
	text: string;
	onPress: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
};

const ComponentButton: FC<Button> = ({
	text,
	onPress,
	width = "90%",
	disabled = false,
}) => {
	const scaleValue = useRef(new Animated.Value(1)).current;

	const handlePress = () => {
		Animated.spring(scaleValue, {
			toValue: 0.00001,
			useNativeDriver: true,
		}).start();
		setTimeout(() => {
			Animated.spring(scaleValue, {
				toValue: 1,
				useNativeDriver: true,
			}).start();
			onPress();
		}, 100);
	};

	return (
		<Animated.View style={{ transform: [{ scale: scaleValue }] }}>
			<TouchableOpacity
				style={[
					styles.button,
					disabled && styles.disabled_button,
					{ width },
				]}
				onPress={handlePress}
				disabled={disabled}
			>
				<ComponentText text={text} alignSelf={"center"} />
			</TouchableOpacity>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#006769",
		padding,
		borderRadius,
		alignItems: "center",
		justifyContent: "center",
	},
	disabled_button: {
		opacity: 0.5,
	},
});

export default ComponentButton;
