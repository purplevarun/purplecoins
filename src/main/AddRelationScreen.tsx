import { useState } from "react";
import RelationMap from "./RelationMap";
import CustomInput from "./components/CustomInput";
import Header from "./components/Header";
import ScreenLayout from "./components/ScreenLayout";
import RelationType from "./constants/enums/RelationType";
import useDatabase from "./hooks/useDatabase";
import useScreen from "./hooks/useScreen";

const AddRelationScreen = ({ route }: any) => {
	const relation = route.params.relation as RelationType;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	const currentRelation = RelationMap[relation];
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(currentRelation.routes.main)}
				handleSubmit={() => {
					addRelation(name, relation);
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

export default AddRelationScreen;
