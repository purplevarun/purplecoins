import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import FlexView from "../../../components/FlexView";
import { StatusBar } from "react-native";
import Header from "../../../components/Header";
import BottomRouter from "./bottom_router/BottomRouter";

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
