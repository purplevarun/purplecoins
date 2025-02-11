import { useState } from "react";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import RelationMap from "./RelationMap";

const RelationAddScreen = ({ route }: any) => {
	const relationType = route.params.relation as RelationType;
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
			/>
		</ScreenLayout>
	);
};

export default RelationAddScreen;
