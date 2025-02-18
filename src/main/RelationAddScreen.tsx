import { useState } from "react";
import CustomInput from "./CustomInput";
import Header from "./Header";
import RelationMap from "./RelationMap";
import RelationType from "./RelationType";
import ScreenLayout from "./ScreenLayout";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";

const RelationAddScreen = ({
	route,
}: {
	route?: { params: { relation: RelationType } };
}) => {
	const relationType = route!.params.relation;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	const currentRelation = RelationMap[relationType];
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(currentRelation.routes.main)}
				handleSubmit={() => {
					addRelation(name, relationType);
					navigate(currentRelation.routes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput
				name={`${currentRelation.name} Name`}
				value={name}
				setValue={setName}
				autoFocus
			/>
		</ScreenLayout>
	);
};

export default RelationAddScreen;
