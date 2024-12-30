import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "./ScreenLayout";
import useCategoryService from "./CategoryService";
import DataTab from "./DataTab";
import LinkedTransactions from "./LinkedTransactions";
import useAppStore from "./AppStore";

const CategoryDetail = ({ route }: any) => {
	const categoryId = route.params?.categoryId ?? null;
	const { fetchCategory, handleEdit, handleDelete, fetchTransactions } =
		useCategoryService();
	const { setOnDelete, setOnEdit } = useAppStore();
	const category = fetchCategory(categoryId);
	const transactions = fetchTransactions(categoryId);
	useFocusEffect(
		useCallback(() => {
			setOnEdit(() => handleEdit(categoryId));
			setOnDelete(() => handleDelete(categoryId));
		}, [categoryId]),
	);
	return (
		<ScreenLayout>
			<DataTab name={"Name"} value={category.name} />
			<DataTab name={"Type"} value={category.type} />
			<DataTab
				name={"Monthly Budget"}
				value={category.monthlyBudget ?? "Not set"}
			/>
			<DataTab
				name={"Annual Budget"}
				value={category.annualBudget ?? "Not set"}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default CategoryDetail;
