import { formatMoney } from "../../../util/HelperFunctions";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import SourceRoutes from "./SourceRoutes";
import CustomText from "../../../components/CustomText";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/DatabaseFunctions";

const SourceMain = () => {
	const { sources } = useDatabase();
	const total = sources.reduce((sum, model) => sum + model.amount, 0);
	return (
		<ScreenLayout>
			{sources.length === 0 ? (
				<NoContent sources />
			) : (
				<View>
					<View style={{ paddingVertical: PADDING }}>
						<CustomText
							text={`Total Net Worth = ${formatMoney(total)}`}
							alignSelf={CENTER}
						/>
					</View>
					<FlatList
						data={sources}
						renderItem={({ item }) => {
							return (
								<TouchableOpacity
									style={{
										backgroundColor: SECONDARY_COLOR,
										borderRadius: BORDER_RADIUS,
										padding: PADDING,
										margin: MARGIN,
										flexDirection: FLEX_ROW,
										justifyContent: SPACE_BETWEEN,
									}}
								>
									<CustomText text={item.name} />
									<CustomText
										text={formatMoney(item.amount)}
									/>
								</TouchableOpacity>
							);
						}}
					/>
				</View>
			)}
			<PlusButton to={SourceRoutes.Add} />
		</ScreenLayout>
	);
};

export default SourceMain;
