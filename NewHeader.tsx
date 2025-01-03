import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import DeleteButton from "./DeleteButton";
import useSourceService from "./SourceService";
import { PRIMARY_COLOR } from "./colors.config";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const NewHeader = ({
	screenName,
	currentId,
}: {
	screenName: string;
	currentId?: string;
}) => {
	const { name: routeName } = useRoute();
	const [name, screenType] = routeName.split(".");
	const title = useMemo(() => {
		if (screenType === "Main") return name + "s";
		else if (screenType === "Add") return "Add " + name;
		else if (screenType === "Edit") return "Edit " + name;
		else return name + " Details";
	}, [name, screenType]);
	const mainScreen = useMemo(() => name + ".Main", [name, screenType]);
	const addScreen = useMemo(() => name + ".Add", [name, screenType]);
	const editScreen = useMemo(() => name + ".Edit", [name, screenType]);
	const editParams = useMemo(() => {
		if (name === "Transaction") return { transactionId: currentId };
		else if (name === "Source") return { sourceId: currentId };
		else if (name === "Category") return { categoryId: currentId };
		else if (name === "Trip") return { tripId: currentId };
		else
			return {
				investmentId: currentId,
			};
	}, [name, screenType]);
	const { navigate } = useNavigation<any>();
	const { handleDelete: deleteSource } = useSourceService();
	const handleDelete = () => {
		if (!currentId) return;
		if (name === "Source") {
			deleteSource(currentId);
		}
	};
	return (
		<View
			style={{
				height: HEADER_HEIGHT,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
		>
			<CustomText
				text={title}
				alignSelf={CENTER}
				fontSize={
					screenName.length > 15
						? LARGE_FONT_SIZE
						: LARGE_FONT_SIZE * 1.2
				}
			/>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
					gap: PADDING / 2,
				}}
			>
				{screenType === "Main" && (
					<TouchableOpacity
						style={{ alignSelf: CENTER }}
						onPress={() => navigate(addScreen)}
					>
						<FontAwesome
							name="plus"
							size={LARGE_FONT_SIZE * 1.6}
							color={PRIMARY_COLOR}
						/>
					</TouchableOpacity>
				)}
				{screenType === "Detail" && (
					<TouchableOpacity
						style={{ alignSelf: CENTER }}
						onPress={() => navigate(editScreen, editParams)}
					>
						<FontAwesome
							name="pencil-square"
							size={LARGE_FONT_SIZE * 1.5}
							color={PRIMARY_COLOR}
						/>
					</TouchableOpacity>
				)}
				{screenType === "Detail" && currentId && (
					<DeleteButton onDelete={handleDelete} />
				)}
				{screenType === "Add" ||
					(screenType === "Edit" && (
						<TouchableOpacity
							style={{ alignSelf: CENTER, bottom: 1 }}
							onPress={() => navigate(mainScreen)}
						>
							<FontAwesome
								name="close"
								size={LARGE_FONT_SIZE * 1.6}
								color={PRIMARY_COLOR}
							/>
						</TouchableOpacity>
					))}
			</View>
		</View>
	);
};

export default NewHeader;
