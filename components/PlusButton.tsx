import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { FONT_SIZE } from "../config/constants.config";
import { useNavigation } from "@react-navigation/native";
import { BACKGROUND_COLOR } from "../config/colors.config";

const PlusButton = ({ to }: { to: string }) => {
	const addImgSource = "./../assets/add.png";
	const source = require(addImgSource);
	const navigation = useNavigation<any>();
	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => {
				navigation.navigate(to);
			}}
		>
			<Image source={source} style={styles.image} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	image: {
		width: FONT_SIZE * 2.5,
		height: FONT_SIZE * 2.5,
		borderRadius: (FONT_SIZE * 2) / 2,
		backgroundColor: BACKGROUND_COLOR,
	},
	button: {
		position: "absolute",
		right: FONT_SIZE / 2,
		bottom: FONT_SIZE / 2,
		zIndex: 1,
	},
});

export default PlusButton;
