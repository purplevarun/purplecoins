import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CustomText from "./CustomText";
import Header from "./Header";
import ITrip from "./ITrip";
import PlusButton from "./PlusButton";
import ScreenLayout from "./ScreenLayout";
import TripRenderItem from "./TripRenderItem";
import useTripService from "./TripService";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import useNavigate from "./useNavigate";

const TripMain = () => {
	const { fetchTrips } = useTripService();
	const [trips, setTrips] = useState<ITrip[]>([]);
	useFocusEffect(useCallback(() => setTrips(fetchTrips()), []));
	const { navigateToTripAdd } = useNavigate();
	return (
		<ScreenLayout>
			<Header title={"Trips"} navigateToAddScreen={navigateToTripAdd} />
			{trips.length > 0 ? (
				<FlatList
					data={trips}
					renderItem={({ item }) => <TripRenderItem item={item} />}
				/>
			) : (
				<CustomText
					text={"No Trip found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
			<PlusButton to={"Trip.Add"} />
		</ScreenLayout>
	);
};

export default TripMain;
