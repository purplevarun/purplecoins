import { sourceRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const TripEdit = ({ route }: any) => {
	const id = route.params.id;
	const { tripName, setTripName } = useValues();
	const { navigate } = useScreen();
	const { fetchTrip, updateTrip } = useDatabase();

	useFocus(() => {
		const trip = fetchTrip(id);
		setTripName(trip.name);
	});

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(sourceRoutes.main)}
				handleSubmit={() => updateTrip(id)}
				canBeSubmitted={tripName !== ""}
			/>
			<CustomInput
				name={"Name"}
				value={tripName}
				setValue={setTripName}
			/>
		</ScreenLayout>
	);
};

export default TripEdit;
