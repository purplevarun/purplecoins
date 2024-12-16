import { CENTER, FONT_SIZE, LARGE_FONT_SIZE, PADDING } from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import useCategoryService from "./CategoryService";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import EditButton from "../../../components/EditButton";
import DeleteButton from "../../../components/DeleteButton";
import Vertical from "../../../components/Vertical";
import DataTab from "../../../components/DataTab";
import { FlatList, View } from "react-native";
import TransactionRenderItem from "../transaction/TransactionRenderItem";

const CategoryDetail = () => {
	const {
		fetchCategory,
		handleEdit,
		handleDelete,
		fetchTransactions
	} = useCategoryService();
	const category = fetchCategory();
	const transactions = fetchTransactions();

	return (
		<ScreenLayout>
			<CloseButton />
			<EditButton onPress={handleEdit} />
			<DeleteButton onDelete={handleDelete} />
			<Vertical />
			<CustomText
				text={"Category Detail"}
				fontSize={LARGE_FONT_SIZE}
				alignSelf={CENTER}
			/>
			<Vertical size={FONT_SIZE / 5} />
			<DataTab name={"Name"} value={category.name} />
			<DataTab name={"Type"} value={category.type} />
			<DataTab name={"Monthly Budget"} value={category.monthlyBudget ?? "Not set"} />
			<DataTab name={"Annual Budget"} value={category.annualBudget ?? "Not set"} />
			{transactions && transactions.length > 0 &&
				<View style={{ paddingTop: PADDING }}>
					<CustomText
						text={"Linked Transactions"}
						fontSize={LARGE_FONT_SIZE}
					/>
					<Vertical />
					<FlatList
						data={transactions}
						renderItem={({ item }) => <TransactionRenderItem item={item} />}
					/>
				</View>
			}
		</ScreenLayout>
	);
};

export default CategoryDetail;