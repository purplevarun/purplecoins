import { View } from "react-native";
import { useQuery } from "@realm/react";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategorySection from "./CategorySection";
import ExpenseType from "../../../types/ExpenseType";
import CategoryModel from "../../../models/CategoryModel";
import NoContent from "../../other/NoContent";

const CategoryMain = () => {
	const categoryList = useQuery(CategoryModel);
	console.log(categoryList);
	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			{categoryList.length === 0 ? (
				<NoContent categories />
			) : (
				<View>
					<CategorySection
						categoryList={categoryList}
						type={ExpenseType.EXPENSE}
					/>
					<CategorySection
						categoryList={categoryList}
						type={ExpenseType.INCOME}
					/>
				</View>
			)}
		</ScreenLayout>
	);
};

export default CategoryMain;
