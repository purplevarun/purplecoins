import { View } from "react-native";
import RelationType from "../../constants/enums/RelationType";
import RelationWithTotal from "../../types/RelationWithTotal";
import Sector from "./Sector";

const Sectors = ({ relations }: { relations: RelationWithTotal[] }) => {
	return (
		<View>
			<Sector
				text={"Top Spending Categories"}
				type={RelationType.CATEGORY}
				relations={relations}
			/>
			<Sector
				text={"Highest Investments"}
				type={RelationType.INVESTMENT}
				relations={relations}
			/>
			<Sector
				text={"Preferred Accounts"}
				type={RelationType.SOURCE}
				relations={relations}
			/>
			<Sector
				text={"Top Travel Expenses"}
				type={RelationType.TRIP}
				relations={relations}
			/>
		</View>
	);
};

export default Sectors;
