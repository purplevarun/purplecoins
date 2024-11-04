import { useQuery } from "@realm/react";
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
import InvestmentRoutes from "./InvestmentRoutes";
import PlusButton from "../../../components/PlusButton";
import CustomText from "../../../components/CustomText";
import InvestmentModel from "../../../models/InvestmentModel";

const InvestmentMain = () => {
	const investmentModels = useQuery(InvestmentModel);

	return (
		<ScreenLayout>
			<FlatList
				data={investmentModels}
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
							<CustomText text={item.name} alignSelf={CENTER} />
							<View>
								<CustomText
									text={item.investedAmount ?? "<invested>"}
								/>
								<CustomText
									text={item.currentAmount ?? "<current>"}
								/>
							</View>
						</TouchableOpacity>
					);
				}}
			/>
			<PlusButton to={InvestmentRoutes.Add} />
		</ScreenLayout>
	);
};

export default InvestmentMain;
