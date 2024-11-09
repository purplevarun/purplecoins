import { FlatList, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import { useQuery } from "@realm/react";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import ScreenLayout from "../../../components/ScreenLayout";
import InvestmentRoutes from "./InvestmentRoutes";
import PlusButton from "../../../components/PlusButton";
import CustomText from "../../../components/CustomText";
import InvestmentModel from "../../../models/InvestmentModel";
import NoContent from "../../other/NoContent";

const InvestmentMain = () => {
	const investmentModels = useQuery(InvestmentModel);
	return (
		<ScreenLayout>
			{investmentModels.length === 0 ? (
				<NoContent investments />
			) : (
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
								<CustomText
									text={item.name}
									alignSelf={CENTER}
								/>
								<View>
									<CustomText text={item.investedAmount} />
									<CustomText text={item.currentAmount} />
								</View>
							</TouchableOpacity>
						);
					}}
				/>
			)}
			<PlusButton to={InvestmentRoutes.Add} />
		</ScreenLayout>
	);
};
export default InvestmentMain;
