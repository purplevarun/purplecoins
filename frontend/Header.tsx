import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import {
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
} from "./config/constants.config";
import Routes from "./Routes";
import { TouchableOpacity, View } from "react-native";
import {
	BACKGROUND_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "./config/colors.config";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CLOSE_ICON } from "./config/icons.config";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomText from "./components/CustomText";

const Header = ({ route }: DrawerHeaderProps) => {
	const { toggleDrawer, navigate } = useNavigation<any>();
	const size = FONT_SIZE * 2;
	const excludedHeaderMap = {
		[Routes.User.Main]: Routes.Transaction.Main,
		[Routes.Transaction.Add]: Routes.Transaction.Main,
		[Routes.Category.Add]: Routes.Category.Main,
		[Routes.Trip.Add]: Routes.Trip.Main,
		[Routes.Source.Add]: Routes.Source.Main,
		[Routes.Investment.Add]: Routes.Investment.Main,
	};

	const handleLeftHeader = (route: string) => {
		if (Object.keys(excludedHeaderMap).includes(route)) {
			return { visible: true, path: excludedHeaderMap[route] };
		} else {
			return { visible: false };
		}
	};
	const leftHeader = handleLeftHeader(route.name);
	return (
		<View
			style={{
				backgroundColor: BACKGROUND_COLOR,
				height: HEADER_HEIGHT,
				flexDirection: FLEX_ROW,
				gap: FONT_SIZE,
				paddingHorizontal: PADDING,
				borderBottomColor: PRIMARY_COLOR,
				borderBottomWidth: 2,
			}}
		>
			{leftHeader.visible ? (
				<TouchableOpacity
					onPress={() => navigate(leftHeader.path)}
					testID={"closeIcon"}
					style={{ alignSelf: CENTER }}
				>
					<FontAwesome
						name={CLOSE_ICON}
						size={FONT_SIZE * 2}
						color={RED_COLOR}
					/>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					onPress={() => toggleDrawer()}
					testID={"menuIcon"}
					style={{ alignSelf: CENTER }}
				>
					<FontAwesome5
						name={"bars"}
						size={size}
						color={PRIMARY_COLOR}
					/>
				</TouchableOpacity>
			)}
			<CustomText
				text={route.name}
				fontSize={LARGE_FONT_SIZE}
				alignSelf={CENTER}
			/>
		</View>
	);
};

export default Header;
