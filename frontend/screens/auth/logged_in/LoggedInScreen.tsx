import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import { FLEX_ONE } from "../../../config/constants.config";
import { StatusBar, StyleSheet, View } from "react-native";
import Header from "./Header";
import BottomRouter from "./BottomRouter";

const LoggedInScreen = () => {
	useEffect(() => {
		NavigationBar.setBackgroundColorAsync(SECONDARY_COLOR).catch();
	}, []);

	return (
		<View style={styles.flexView}>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<Header />
			<BottomRouter />
		</View>
	);
};

const styles = StyleSheet.create({
	flexView: {
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR
	}
});

export default LoggedInScreen;
