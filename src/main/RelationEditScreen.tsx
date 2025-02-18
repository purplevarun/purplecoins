import { useState } from "react";
import CustomInput from "./CustomInput";
import Header from "./Header";
import RelationMap from "./RelationMap";
import RelationType from "./RelationType";
import ScreenLayout from "./ScreenLayout";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";

const RelationEditScreen = ({ route }: any) => {
	const relationType = route.params.relation as RelationType;
	const id = route.params.id;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { fetchRelation, updateRelation } = useDatabase();
	const relation = RelationMap[relationType];
	useFocus(() => setName(fetchRelation(id).name));
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(relation.routes.main)}
				handleSubmit={() => {
					updateRelation(id, name);
					navigate(relation.routes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput
				name={`${relation.name} Name`}
				value={name}
				setValue={setName}
				autoFocus
			/>
		</ScreenLayout>
	);
};

export default RelationEditScreen;
