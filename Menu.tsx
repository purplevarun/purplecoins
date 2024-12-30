import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { TouchableOpacity, View } from "react-native";
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
	RED_COLOR,
	SECONDARY_COLOR,
} from "./colors.config";
import CustomText from "./CustomText";
import { menuRoutes } from "./Routes";
import CustomButton from "./CustomButton";
import { expo } from "./app.json";
import { useSQLiteContext } from "expo-sqlite";
import IUser from "./IUser";
import {
	delete_single_user,
	select_all_users,
	sync_queries,
} from "./queries.config";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import useAppStore from "./AppStore";

const Menu = ({ navigation }: DrawerContentComponentProps) => {
	const db = useSQLiteContext();
	const { navigate } = navigation;
	const { triggerReRender } = useAppStore();
	const userName = db.getFirstSync<IUser>(select_all_users)?.name ?? "User";
	return (
		<View
			style={{
				flex: FLEX_ONE,
				backgroundColor: BACKGROUND_COLOR,
			}}
		>
			<TouchableOpacity
				onPress={() => {
					sync_queries.delete.forEach((query) => db.runSync(query));
					db.runSync(delete_single_user);
					triggerReRender();
				}}
				testID={"logoutIcon"}
			>
				<FontAwesome5
					name="sign-out-alt"
					size={FONT_SIZE * 2}
					color={RED_COLOR}
					alignSelf={FLEX_END}
					right={FONT_SIZE}
				/>
			</TouchableOpacity>
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
						color={DISABLED_COLOR}
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
			<CustomText
				text={`Welcome ${userName}`}
				fontSize={LARGE_FONT_SIZE}
				alignSelf={CENTER}
			/>
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
