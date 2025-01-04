import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { TouchableOpacity, View } from "react-native";
import tabRoutes from "./TabRoutes";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
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
			{Object.entries(tabRoutes).map(([key, { Icon }], idx) => {
				return (
					<TouchableOpacity onPress={() => navigate(key)} key={key}>
						<Icon
							color={
								idx === index ? PRIMARY_COLOR : DISABLED_COLOR
							}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default TabBar;
