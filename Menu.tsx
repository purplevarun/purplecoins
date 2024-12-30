import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { View } from "react-native";
import {
	CENTER,
	FLEX_END,
	FLEX_ONE,
	FLEX_START,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	PADDING,
	SCREEN_HEIGHT,
} from "./constants.config";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	SECONDARY_COLOR,
} from "./colors.config";
import CustomText from "./CustomText";
import { menuRoutes } from "./Routes";
import CustomButton from "./CustomButton";
import { expo } from "./app.json";

const Menu = ({ navigation }: DrawerContentComponentProps) => {
	const { navigate } = navigation;
	return (
		<View
			style={{
				flex: FLEX_ONE,
				backgroundColor: BACKGROUND_COLOR,
			}}
		>
			<View
				style={{
					height: SCREEN_HEIGHT / 6,
					justifyContent: CENTER,
				}}
			>
				<View style={{ alignSelf: CENTER }}>
					<CustomText
						text={expo.name}
						fontSize={LARGE_FONT_SIZE * 1.5}
					/>
					<CustomText
						text={"by purplevarun"}
						alignSelf={FLEX_END}
					/>
				</View>
				<View style={{ right: PADDING, top: FONT_SIZE }}>
					<CustomText
						text={expo.version}
						color={DISABLED_COLOR}
						alignSelf={FLEX_END}
					/>
				</View>
			</View>
			<View
				style={{
					backgroundColor: BACKGROUND_COLOR,
					flex: FLEX_ONE,
					justifyContent: FLEX_START,
					borderTopRightRadius: FONT_SIZE,
					borderTopLeftRadius: FONT_SIZE,
					paddingTop: FONT_SIZE,
				}}
			>
				{menuRoutes.map((text) => (
					<CustomButton
						text={text}
						onPress={() => navigate(text)}
						color={SECONDARY_COLOR}
						key={text}
						marginV={FONT_SIZE / 2}
					/>
				))}
			</View>
		</View>
	);
};

export default Menu;
