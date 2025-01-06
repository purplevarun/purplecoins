import { FlatList } from "react-native";
import Header from "../Header";
import NoContent from "../NoContent";
import ScreenLayout from "../ScreenLayout";
import useFocus from "../useFocus";
import TripRenderItem from "./TripRenderItem";
import useTrip from "./useTrip";

const TripMain = () => {
	const { handleMainFocus, handlePlus, trips } = useTrip();
	useFocus(handleMainFocus);

	if (trips.length === 0) return <NoContent handlePlus={handlePlus} />;

	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlatList data={trips} renderItem={TripRenderItem} />
		</ScreenLayout>
	);
};

export default TripMain;
