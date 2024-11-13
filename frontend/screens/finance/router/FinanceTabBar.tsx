import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
	SECONDARY_COLOR,
} from "../../../config/colors.config";
import CustomText from "../../../components/CustomText";
import {
	CENTER,
	FLEX_ROW,
	SMALL_FONT_SIZE,
	SPACE_EVENLY,
	TOP_TAB_HEIGHT,
} from "../../../config/constants.config";

const FinanceTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
	return (
		<View style={styles.container}>
			{state.routes.map((route, index) => {
				const isFocused = state.index === index;
				const onPress = () => navigation.navigate(route.name);
				const color = isFocused ? PRIMARY_COLOR : DISABLED_COLOR;
				return (
					<TouchableOpacity key={route.name} onPress={onPress}>
						<CustomText
							text={route.name}
							color={color}
							fontSize={SMALL_FONT_SIZE}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_EVENLY,
		backgroundColor: SECONDARY_COLOR,
		height: TOP_TAB_HEIGHT,
		alignItems: CENTER,
	},
});

export default FinanceTabBar;
