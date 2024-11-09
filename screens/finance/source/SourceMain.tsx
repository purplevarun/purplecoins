import { useQuery } from "@realm/react";
import { FlatList, TouchableOpacity, View } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import SourceRoutes from "./SourceRoutes";
import SourceModel from "../../../models/SourceModel";
import CustomText from "../../../components/CustomText";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import NoContent from "../../other/NoContent";

const SourceMain = () => {
	const sourceModels = [...useQuery(SourceModel)].sort(
		(a, b) => b.amount - a.amount,
	);
	console.log(JSON.stringify(sourceModels, null, 2));
	const total = sourceModels.reduce((sum, model) => sum + model.amount, 0);
	return (
		<ScreenLayout>
			{sourceModels.length === 0 ? (
				<NoContent sources />
			) : (
				<View>
					<View style={{ paddingVertical: PADDING }}>
						<CustomText
							text={`Total Net Worth = ${total}`}
							alignSelf={CENTER}
						/>
					</View>
					<FlatList
						data={sourceModels}
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
									<CustomText text={item.amount} />
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
