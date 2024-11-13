import { View } from "react-native";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategorySection from "./CategorySection";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/DatabaseFunctions";
import ExpenseType from "../../../types/ExpenseType";

const CategoryMain = () => {
	const { categories } = useDatabase();
	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			{categories.length === 0 ? (
				<NoContent categories />
			) : (
				<View>
					<CategorySection
						categoryList={categories}
						type={ExpenseType.EXPENSE}
					/>
					<CategorySection
						categoryList={categories}
						type={ExpenseType.INCOME}
					/>
				</View>
			)}
		</ScreenLayout>
	);
};

export default CategoryMain;
