import { useQuery } from "@realm/react";
import { DISABLED_COLOR, SECONDARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	FONT_SIZE,
	PADDING,
} from "../../../config/dimensions.config";
import { FlatList, TouchableOpacity, Animated, View } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import PlusButton from "../../../components/PlusButton";
import CategoryModel from "../../../models/CategoryModel";
import { Results } from "realm";

const CategoryMain = () => {
	const categoryList = useQuery(CategoryModel);

	return (
		<ScreenLayout>
			<PlusButton to={"Category.Add"} />
			<CategoryBlock categoryList={categoryList} type={"EXPENSE"} />
			<CategoryBlock categoryList={categoryList} type={"INCOME"} />
		</ScreenLayout>
	);
};

const CategoryBlock = ({
	categoryList,
	type,
}: {
	categoryList: Results<CategoryModel>;
	type: "INCOME" | "EXPENSE";
}) => {
	const renderItem = ({ item }: { item: CategoryModel }) => (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: PADDING / 2,
			}}
		>
			<Animated.View>
				<CustomText text={item.name} />
			</Animated.View>
		</TouchableOpacity>
	);
	const filteredList = categoryList.filter((x) => x.type === type);
	return (
		<View style={{ height: "50%" }}>
			<View style={{ marginVertical: PADDING }}>
				<CustomText
					text={
						type === "EXPENSE"
							? "Expense Categories"
							: "Income Categories"
					}
					alignSelf="center"
				/>
			</View>
			<View style={{ height: FONT_SIZE / 2 }} />
			{filteredList.length === 0 ? (
				<CustomText
					text={`Click on the Plus Button to add a new ${type} category`}
					color={DISABLED_COLOR}
				/>
			) : (
				<FlatList data={filteredList} renderItem={renderItem} />
			)}
		</View>
	);
};

export default CategoryMain;
