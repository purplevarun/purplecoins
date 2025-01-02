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

const TabBar = (props: MaterialTopTabBarProps) => {
	const { index } = props.state;
	const { navigate } = props.navigation;
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
				paddingTop: PADDING,
				paddingHorizontal: PADDING * 2,
			}}
		>
			{Object.entries(tabRoutes).map(([key, { icon }], idx) => {
				const color = idx === index ? PRIMARY_COLOR : DISABLED_COLOR;
				return (
					<TouchableOpacity
						onPress={() => navigate(key)}
						key={icon.name}
					>
						<icon.base
							name={icon.name}
							size={FONT_SIZE * 2}
							color={color}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default TabBar;
