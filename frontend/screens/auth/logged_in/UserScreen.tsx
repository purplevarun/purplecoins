import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import {
	BACKGROUND_COLOR,
	BLUE_COLOR,
	DISABLED_COLOR,
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../../../config/colors.config";
import { USER_ICON } from "../../../config/icons.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	PADDING,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import Vertical from "../../../components/Vertical";
import CustomButton from "../../../components/CustomButton";
import useAuthService from "../AuthService";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import useSync from "./SyncService";

const UserScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	}, []);
	const { userName, logOut } = useAuthService();
	const { uploadData, downloadData, msg } = useSync();
	return (
		<ScreenLayout>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
			<CloseButton />
			<Vertical size={FONT_SIZE / 2} />
			<CustomText
				text={`Welcome ${userName}`}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={FONT_SIZE / 4} />
			<View style={styles.icon}>
				<FontAwesome5
					name={USER_ICON}
					color={PRIMARY_COLOR}
					size={SCREEN_WIDTH / 2.5}
				/>
			</View>
			<Vertical size={FONT_SIZE / 4} />
			{msg.text.length > 0 && (
				<CustomText
					text={msg.text}
					color={msg.color}
					alignSelf={CENTER}
				/>
			)}
			<CustomButton
				text={"Upload Data"}
				width={SCREEN_WIDTH / 1.5}
				color={GREEN_COLOR}
				onPress={uploadData}
			/>
			<CustomButton
				text={"Download Data"}
				width={SCREEN_WIDTH / 1.5}
				color={BLUE_COLOR}
				onPress={downloadData}
			/>
			<CustomButton
				text={"Log out"}
				width={SCREEN_WIDTH / 1.5}
				color={RED_COLOR}
				onPress={logOut}
			/>
		</ScreenLayout>
	);
};

const styles = StyleSheet.create({
	icon: {
		backgroundColor: DISABLED_COLOR,
		height: SCREEN_HEIGHT / 4,
		width: SCREEN_WIDTH / 2,
		alignSelf: CENTER,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		alignItems: CENTER,
		borderColor: PRIMARY_COLOR,
		borderWidth: BORDER_WIDTH,
		justifyContent: CENTER,
	},
});

export default UserScreen;
