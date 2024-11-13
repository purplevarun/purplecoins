import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../../config/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	PADDING,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
} from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import CustomText from "../../components/CustomText";
import CloseButton from "../../components/CloseButton";
import Vertical from "../../components/Vertical";
import useDatabase from "../../util/DatabaseFunctions";
import LoggedInRoutes from "./LoggedInRoutes";
import { USER_ICON } from "../../config/icons.config";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomButton from "../../components/CustomButton";
import { useRealm } from "@realm/react";

const UserScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	}, []);
	const { user } = useDatabase();
	const realm = useRealm();
	return (
		<ScreenLayout>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
			<CloseButton path={LoggedInRoutes.Main} />
			<Vertical size={FONT_SIZE / 2} />
			<CustomText
				text={`Welcome ${user.name}`}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={FONT_SIZE / 4} />
			<View
				style={{
					backgroundColor: DISABLED_COLOR,
					height: SCREEN_HEIGHT / 4,
					width: SCREEN_WIDTH / 2,
					alignSelf: CENTER,
					borderRadius: BORDER_RADIUS,
					padding: PADDING,
					justifyContent: CENTER,
					alignItems: CENTER,
					borderColor: PRIMARY_COLOR,
					borderWidth: BORDER_WIDTH,
				}}
			>
				<FontAwesome5
					name={USER_ICON}
					color={PRIMARY_COLOR}
					size={SCREEN_WIDTH / 2.5}
				/>
			</View>
			<Vertical size={FONT_SIZE / 2} />
			<CustomButton
				text={"Log out"}
				width={SCREEN_WIDTH / 2}
				color={RED_COLOR}
				onPress={() => {
					realm.write(() => {
						realm.deleteAll();
					});
				}}
			/>
		</ScreenLayout>
	);
};

export default UserScreen;
