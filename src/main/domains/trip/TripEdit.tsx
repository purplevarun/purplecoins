import { useState } from "react";
import { tripRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";

const TripEdit = ({ route }: any) => {
	const id = route.params.id;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { fetchRelation, updateRelation } = useDatabase();
	useFocus(() => setName(fetchRelation(id).name));

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(tripRoutes.main)}
				handleSubmit={() => {
					updateRelation(id, name);
					navigate(tripRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Source Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default TripEdit;
