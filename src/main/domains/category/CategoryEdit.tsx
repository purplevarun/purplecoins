import { useState } from "react";
import { categoryRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";

const CategoryEdit = ({ route }: any) => {
	const id = route.params.id;
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { fetchRelation, updateRelation } = useDatabase();
	useFocus(() => setName(fetchRelation(id).name));

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(categoryRoutes.main)}
				handleSubmit={() => {
					updateRelation(id, name);
					navigate(categoryRoutes.main);
				}}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput
				name={"Category Name"}
				value={name}
				setValue={setName}
			/>
		</ScreenLayout>
	);
};

export default CategoryEdit;
