import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { tripRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import TripRenderItem from "./TripRenderItem";

const TripMain = () => {
	const [trips, setTrips] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations } = useDatabase();
	const handlePlus = () => navigate(tripRoutes.add);
	useFocus(() => setTrips(fetchAllRelations(RelationType.TRIP)));

	if (trips.length === 0)
		return <NoContent handlePlus={handlePlus} text={"Trips"} />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlashList
				data={trips}
				renderItem={TripRenderItem}
				estimatedItemSize={10}
			/>
		</ScreenLayout>
	);
};

export default TripMain;
