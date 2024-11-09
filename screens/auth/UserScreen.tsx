import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { BACKGROUND_COLOR } from "../../config/colors.config";
import { useQuery } from "@realm/react";
import { CENTER, FONT_SIZE } from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import CustomText from "../../components/CustomText";
import CloseButton from "../../components/CloseButton";
import LoggedInRoutes from "./LoggedInRoutes";
import UserModel from "../../models/UserModel";
import Vertical from "../../components/Vertical";

const UserScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	}, []);
	const userModels = useQuery(UserModel)[0];
	return (
		<ScreenLayout>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
			<CloseButton path={LoggedInRoutes.Dashboard} />
			<Vertical size={FONT_SIZE / 2} />
			<CustomText
				text={`Welcome ${userModels.name}`}
				alignSelf={CENTER}
			/>
		</ScreenLayout>
	);
};

export default UserScreen;
