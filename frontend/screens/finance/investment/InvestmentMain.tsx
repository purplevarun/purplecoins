import { FlatList, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import ScreenLayout from "../../../components/ScreenLayout";
import InvestmentRoutes from "./InvestmentRoutes";
import PlusButton from "../../../components/PlusButton";
import CustomText from "../../../components/CustomText";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/DatabaseFunctions";
import { formatMoney } from "../../../util/HelperFunctions";

const InvestmentMain = () => {
	const { investments } = useDatabase();
	const investedSum = investments.sum("investedAmount");
	const currentSum = investments.sum("currentAmount");
	return (
		<ScreenLayout>
			{investments.length === 0 ? (
				<NoContent investments />
			) : (
				<View>
					<View
						style={{
							paddingLeft: PADDING,
							paddingVertical: PADDING,
						}}
					>
						<CustomText
							text={`Total Investments = ${formatMoney(investedSum)}`}
						/>
						<CustomText
							text={`Total Returns = ${formatMoney(currentSum)}`}
						/>
						<CustomText
							text={`Profit = ${(currentSum / investedSum - 1) * 100}%`}
						/>
					</View>
					<FlatList
						data={investments}
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
										<CustomText
											text={formatMoney(
												item.investedAmount,
											)}
										/>
										<CustomText
											text={formatMoney(
												item.currentAmount,
											)}
										/>
									</View>
								</TouchableOpacity>
							);
						}}
					/>
				</View>
			)}
			<PlusButton to={InvestmentRoutes.Add} />
		</ScreenLayout>
	);
};
export default InvestmentMain;
