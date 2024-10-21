import { useQuery } from "@realm/react";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategorySection from "./CategorySection";
import CategoryModel from "../../../models/CategoryModel";
import ExpenseType from "../../../types/ExpenseType";

const CategoryMain = () => {
	const categoryList = useQuery(CategoryModel);
	console.log(categoryList);
	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			<CategorySection
				categoryList={categoryList}
				type={ExpenseType.EXPENSE}
			/>
			<CategorySection
				categoryList={categoryList}
				type={ExpenseType.INCOME}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
