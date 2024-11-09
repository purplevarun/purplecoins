import { useQuery } from "@realm/react";
import { formatDate, objectify } from "../../../util/HelperFunctions";
import { FlatList, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import PlusButton from "../../../components/PlusButton";
import TripRoutes from "./TripRoutes";
import TripModel from "../../../models/TripModel";
import NoContent from "../../other/NoContent";

const TripMain = () => {
	const tripModels = useQuery(TripModel);
	console.log(objectify(tripModels));
	return (
		<ScreenLayout>
			{tripModels.length === 0 ? (
				<NoContent trips />
			) : (
				<FlatList
					data={tripModels}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={{
								borderRadius: BORDER_RADIUS,
								padding: PADDING,
								margin: MARGIN,
								flexDirection: FLEX_ROW,
								justifyContent: SPACE_BETWEEN,
								backgroundColor: SECONDARY_COLOR,
							}}
						>
							<CustomText text={item.name} />
							<View>
								<CustomText
									text={formatDate(item.startDate)}
									alignSelf={"flex-end"}
								/>
								<CustomText
									text={formatDate(item.endDate)}
									alignSelf={"flex-end"}
								/>
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
			<PlusButton to={TripRoutes.Add} />
		</ScreenLayout>
	);
};

export default TripMain;
