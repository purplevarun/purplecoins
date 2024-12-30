import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { ABSOLUTE, FONT_SIZE } from "./constants.config";
import { useNavigation } from "@react-navigation/native";
import { BACKGROUND_COLOR } from "./colors.config";

const PlusButton = ({ to }: { to: string }) => {
	const addImgSource = "./assets/images/add.png";
	const source = require(addImgSource);
	const { navigate } = useNavigation<any>();
	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => navigate(to)}
			testID={"plusIcon"}
		>
			<Image source={source} style={styles.image} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	image: {
		width: FONT_SIZE * 3,
		height: FONT_SIZE * 3,
		borderRadius: FONT_SIZE,
		backgroundColor: BACKGROUND_COLOR,
	},
	button: {
		position: ABSOLUTE,
		right: FONT_SIZE / 2,
		bottom: FONT_SIZE / 2,
		zIndex: 1,
	},
});

export default PlusButton;
