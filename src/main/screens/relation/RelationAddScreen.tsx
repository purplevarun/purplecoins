import { useState } from "react";
import Header from "../../components/header/Header";
import CustomInput from "../../components/input/CustomInput";
import ScreenLayout from "../../components/layout/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import RelationMap from "./RelationMap";

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
