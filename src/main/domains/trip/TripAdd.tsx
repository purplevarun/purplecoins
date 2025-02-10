import { useState } from "react";
import { tripRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";

const TripAdd = () => {
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(tripRoutes.main)}
				handleSubmit={() => {
					addRelation(name, RelationType.TRIP);
					navigate(tripRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Trip Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default TripAdd;
