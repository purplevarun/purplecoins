import { categoryRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const CategoryEdit = ({ route }: any) => {
	const id = route.params.id;
	const { categoryName, setCategoryName } = useValues();
	const { navigate } = useScreen();
	const { updateCategory, fetchCategory } = useDatabase();

	useFocus(() => {
		const category = fetchCategory(id);
		setCategoryName(category.name);
	});

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(categoryRoutes.main)}
				handleSubmit={() => updateCategory(id)}
				canBeSubmitted={categoryName !== ""}
			/>
			<CustomInput
				name={"Name"}
				value={categoryName}
				setValue={setCategoryName}
			/>
		</ScreenLayout>
	);
};

export default CategoryEdit;
