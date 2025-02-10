import { useState } from "react";
import { sourceRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";

const SourceAdd = () => {
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(sourceRoutes.main)}
				handleSubmit={() => {
					addRelation(name, RelationType.SOURCE);
					navigate(sourceRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Source Name"} value={name} setValue={setName} />
		</ScreenLayout>
	);
};

export default SourceAdd;
