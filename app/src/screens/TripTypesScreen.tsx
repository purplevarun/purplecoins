import GlassCard from "@/components/GlassCard";
import ScreenContainer from "@/components/ScreenContainer";
import SimpleEntityForm from "@/components/SimpleEntityForm";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import tripTypeService from "@/services/tripTypeService";
import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const TripTypesScreen = ({
	navigation,
}: NativeStackScreenProps<
	RootStackParamList,
	"TripTypes"
>): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	return (
		<ScreenContainer>
			<GlassCard>
				<SimpleEntityForm
					onSave={async (name) => {
						await tripTypeService.saveTripType(database, name);
						refreshData();
						navigation.goBack();
					}}
				/>
			</GlassCard>
		</ScreenContainer>
	);
};

export default TripTypesScreen;
