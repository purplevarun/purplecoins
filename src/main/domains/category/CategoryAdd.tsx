import { useState } from "react";
import { categoryRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";

const CategoryAdd = () => {
	const [name, setName] = useState("");
	const navigate = useScreen();
	const { addRelation } = useDatabase();
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(categoryRoutes.main)}
				handleSubmit={() => {
					addRelation(name, RelationType.CATEGORY);
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
export default CategoryAdd;
