import { useState } from "react";
import RelationMap from "./RelationMap";
import CustomInput from "./components/CustomInput";
import Header from "./components/Header";
import ScreenLayout from "./components/ScreenLayout";
import RelationType from "./constants/enums/RelationType";
import useDatabase from "./hooks/useDatabase";
import useFocus from "./hooks/useFocus";
import useScreen from "./hooks/useScreen";

const EditRelationScreen = ({ route }: any) => {
	const relation = route.params.relation as RelationType;
	const id = route.params.id;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { fetchRelation, updateRelation } = useDatabase();
	useFocus(() => setName(fetchRelation(id).name));

	const currentRelation = RelationMap[relation];
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(currentRelation.routes.main)}
				handleSubmit={() => {
					updateRelation(id, name);
					navigate(currentRelation.routes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput
				name={`${currentRelation.name} Name`}
				value={name}
				setValue={setName}
			/>
		</ScreenLayout>
	);
};

export default EditRelationScreen;
