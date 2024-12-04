import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TripRoutes from "./TripRoutes";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/database/DatabaseFunctions";
import TripRenderItem from "./TripRenderItem";
import ITrip from "../../../interfaces/ITrip";

const TripMain = () => {
	const { getTrips } = useDatabase();
	const [trips, setTrips] = useState<null | ITrip[]>(null);

	useFocusEffect(useCallback(() => {
		setTrips(getTrips());
	}, []));

	if (!trips || trips.length === 0)
		return <NoContent trips />;

	return (
		<ScreenLayout>
			<FlatList
				data={trips}
				renderItem={TripRenderItem}
			/>
			<PlusButton to={TripRoutes.Add} />
		</ScreenLayout>
	);
};

export default TripMain;
