import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import Header from "../../components/Header";
import BottomRouter from "../../bottom_router/BottomRouter";
import FlexView from "../../components/FlexView";

const LoggedInScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(SECONDARY_COLOR).catch();
	}, []);

	return (
		<FlexView>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<Header />
			<BottomRouter />
		</FlexView>
	);
};

export default LoggedInScreen;
