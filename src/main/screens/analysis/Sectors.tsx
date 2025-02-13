import { View } from "react-native";
import RelationType from "../../constants/enums/RelationType";
import RelationWithTotal from "../../types/RelationWithTotal";
import Sector from "./Sector";

const Sectors = ({ relations }: { relations: RelationWithTotal[] }) => {
	return (
		<View>
			<Sector
				text={"Top Categories"}
				type={RelationType.CATEGORY}
				relations={relations}
			/>
			<Sector
				text={"Top Investments"}
				type={RelationType.INVESTMENT}
				relations={relations}
			/>
			<Sector
				text={"Top Trips"}
				type={RelationType.TRIP}
				relations={relations}
			/>
		</View>
	);
};

export default Sectors;
