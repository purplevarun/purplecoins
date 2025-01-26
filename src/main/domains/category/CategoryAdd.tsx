import { categoryRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const CategoryAdd = () => {
	const { categoryName, setCategoryName } = useValues();
	const { navigate } = useScreen();
	const { addCategory } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(categoryRoutes.main)}
				handleSubmit={addCategory}
				canBeSubmitted={categoryName !== ""}
			/>
			<CustomInput
				name={"Category Name"}
				value={categoryName}
				setValue={setCategoryName}
			/>
		</ScreenLayout>
	);
};
export default CategoryAdd;
