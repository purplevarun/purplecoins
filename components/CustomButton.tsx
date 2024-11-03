import {
	Animated,
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { BORDER_RADIUS, PADDING, NINETY_P } from "../config/constants.config";
import CustomText from "./CustomText";
import { FC, useRef } from "react";
import { GREEN_COLOR } from "../config/colors.config";

interface Button {
	text?: string;
	onPress?: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
}

const CustomButton: FC<Button> = ({
	text = "Submit",
	onPress = () => {},
	width = NINETY_P,
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
		<Animated.View
			style={{
				transform: [{ scale: scaleValue }],
				alignItems: "center",
				paddingTop: PADDING * 2,
			}}
		>
			<TouchableOpacity
				style={[
					styles.button,
					disabled && styles.disabled_button,
					{ width },
				]}
				onPress={handlePress}
				disabled={disabled}
			>
				<CustomText text={text} alignSelf={"center"} />
			</TouchableOpacity>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: GREEN_COLOR,
		padding: PADDING,
		borderRadius: BORDER_RADIUS,
		alignItems: "center",
		justifyContent: "center",
	},
	disabled_button: {
		opacity: 0.5,
	},
});

export default CustomButton;
