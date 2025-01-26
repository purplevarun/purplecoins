import { tripRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const TripAdd = () => {
	const { tripName, setTripName } = useValues();
	const { navigate } = useScreen();
	const { addTrip } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(tripRoutes.main)}
				handleSubmit={addTrip}
				canBeSubmitted={tripName !== ""}
			/>
			<CustomInput
				name={"Trip Name"}
				value={tripName}
				setValue={setTripName}
			/>
		</ScreenLayout>
	);
};

export default TripAdd;
