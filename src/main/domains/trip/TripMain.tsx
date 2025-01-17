import { FlatList } from "react-native";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
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
