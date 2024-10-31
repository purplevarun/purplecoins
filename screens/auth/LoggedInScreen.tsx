import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import BottomRouter from "../../bottom_router/BottomRouter";
import LoadingScreen from "../other/LoadingScreen";
import FlexView from "../../components/FlexView";

const LoggedInScreen = () => {
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(SECONDARY_COLOR)
			.then()
			.catch()
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <LoadingScreen />;
	return (
		<FlexView>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<Header />
			<BottomRouter />
		</FlexView>
	);
};

export default LoggedInScreen;
