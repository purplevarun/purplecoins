import { DrawerHeaderProps } from "@react-navigation/drawer";
import {
	ParamListBase,
	RouteProp,
	useNavigation,
} from "@react-navigation/native";
import {
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import { headerCloseButtonMap, headerDetailButtonsList } from "./Routes";
import { TouchableOpacity, View } from "react-native";
import { BACKGROUND_COLOR, PRIMARY_COLOR, RED_COLOR } from "./colors.config";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CLOSE_ICON } from "./icons.config";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomText from "./CustomText";
import useTransactionService from "./TransactionService";
import useCategoryService from "./CategoryService";
import useTripService from "./TripService";
import useInvestmentService from "./InvestmentService";
import useSourceService from "./SourceService";
import IProvider from "./IProvider";
import DetailButtons from "./DetailButtons";

const Header = ({ route }: DrawerHeaderProps) => {
	const renderRight = headerDetailButtonsList.includes(route.name);
	return (
		<HeaderLayout>
			<View style={{ flexDirection: FLEX_ROW, gap: FONT_SIZE / 2 }}>
				<HeaderLeft route={route} />
				<CustomText
					text={route.name}
					fontSize={LARGE_FONT_SIZE}
					alignSelf={CENTER}
				/>
			</View>
			{renderRight && <DetailButtons />}
		</HeaderLayout>
	);
};

const HeaderLayout: IProvider = ({ children }) => {
	return (
		<View
			style={{
				backgroundColor: BACKGROUND_COLOR,
				height: HEADER_HEIGHT,
				flexDirection: FLEX_ROW,
				paddingHorizontal: PADDING,
				borderBottomColor: PRIMARY_COLOR,
				borderBottomWidth: 2,
				justifyContent: SPACE_BETWEEN,
			}}
		>
			{children}
		</View>
	);
};

const HeaderLeft = ({ route }: { route: RouteProp<ParamListBase> }) => {
	const { toggleDrawer, navigate } = useNavigation<any>();
	const { clearStore: clearTransactionStore } = useTransactionService();
	const { clearStore: clearCategoryStore } = useCategoryService();
	const { clearStore: clearTripStore } = useTripService();
	const { clearStore: clearInvestmentStore } = useInvestmentService();
	const { clearStore: clearSourceStore } = useSourceService();
	const size = FONT_SIZE * 2;
	const handleLeftHeader = (route: string) => {
		if (Object.keys(headerCloseButtonMap).includes(route)) {
			return { visible: true, path: headerCloseButtonMap[route] };
		} else {
			return { visible: false };
		}
	};
	const leftHeader = handleLeftHeader(route.name);
	if (leftHeader.visible)
		return (
			<TouchableOpacity
				onPress={() => {
					navigate(leftHeader.path);
					clearTransactionStore();
					clearCategoryStore();
					clearTripStore();
					clearInvestmentStore();
					clearSourceStore();
				}}
				testID={"closeIcon"}
				style={{ alignSelf: CENTER }}
			>
				<FontAwesome name={CLOSE_ICON} size={size} color={RED_COLOR} />
			</TouchableOpacity>
		);

	return (
		<TouchableOpacity
			onPress={() => toggleDrawer()}
			testID={"menuIcon"}
			style={{ alignSelf: CENTER }}
		>
			<FontAwesome5 name={"bars"} size={size} color={PRIMARY_COLOR} />
		</TouchableOpacity>
	);
};

export default Header;
