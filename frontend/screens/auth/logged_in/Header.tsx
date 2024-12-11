import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../../config/colors.config";
import {
	CENTER,
	FLEX_ROW, FLEX_START,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import { PADDING } from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "../../../app.json";
import { USER_ICON } from "../../../config/icons.config";
import { useNavigation } from "@react-navigation/native";
import LoggedInRoutes from "./LoggedInRoutes";

const Header = () => {
	const { navigate } = useNavigation<any>();
	return (
		<View style={styles.container}>
			<TouchableOpacity style={{ paddingLeft: PADDING / 2 }}>
				<CustomText
					text={app.expo.name}
					fontSize={LARGE_FONT_SIZE}
					alignSelf={CENTER}
				/>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => navigate(LoggedInRoutes.User)}>
				<FontAwesome5
					name={USER_ICON}
					size={LARGE_FONT_SIZE}
					color={PRIMARY_COLOR}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: SECONDARY_COLOR,
		height: HEADER_HEIGHT,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		alignItems: FLEX_START,
		paddingHorizontal: PADDING
	}
});

export default Header;
