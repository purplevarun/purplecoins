import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { View } from "react-native";
import tabRoutes from "./TabRoutes";
import {
	FLEX_ROW,
	FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const TabBar = (props: MaterialTopTabBarProps) => (
	<TabBarImplementation {...props} />
);

const TabBarImplementation = (props: MaterialTopTabBarProps) => {
	const { index } = props.state;
	const { navigate } = props.navigation;
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
				paddingTop: PADDING,
				paddingHorizontal: FONT_SIZE,
			}}
		>
			{Object.values(tabRoutes).map(({ Icon }, idx) => (
				<Icon active={idx === index} navigate={navigate} key={idx} />
			))}
		</View>
	);
};

export default TabBar;
