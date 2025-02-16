import { useState } from "react";
import Header from "../../components/header/Header";
import CustomInput from "../../components/input/CustomInput";
import ScreenLayout from "../../components/layout/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
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
