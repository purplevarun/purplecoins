import { useState } from "react";
import Header from "./Header";
import CustomInput from "./CustomInput";
import ScreenLayout from "./ScreenLayout";
import RelationType from "./RelationType";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";
import RelationMap from "./RelationMap";

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
			/>
		</ScreenLayout>
	);
};

export default RelationEditScreen;
