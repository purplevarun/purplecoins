import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import ScreenLayout from "../../components/ScreenLayout";
import PlusButton from "../../components/PlusButton";
import NoContent from "../../NoContent";
import TripRenderItem from "./TripRenderItem";
import ITrip from "../../interfaces/ITrip";
import useTripService from "./TripService";
import Routes from "../../Routes";

const TripMain = () => {
	const { fetchTrips } = useTripService();
	const [trips, setTrips] = useState<null | ITrip[]>(null);
	useFocusEffect(useCallback(() => setTrips(fetchTrips()), []));
	if (!trips || trips.length === 0) return <NoContent trips />;
	return (
		<ScreenLayout>
			<FlatList
				data={trips}
				renderItem={({ item }) => <TripRenderItem item={item} />}
			/>
			<PlusButton to={Routes.Trip.Add} />
		</ScreenLayout>
	);
};

export default TripMain;
