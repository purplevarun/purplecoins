import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategoryContent from "./CategoryContent";

const CategoryMain = () => {
	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			<CategoryContent />
		</ScreenLayout>
	);
};

export default CategoryMain;
