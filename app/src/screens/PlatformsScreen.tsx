import GlassCard from "@/components/GlassCard";
import ScreenContainer from "@/components/ScreenContainer";
import SimpleEntityForm from "@/components/SimpleEntityForm";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import platformService from "@/services/platformService";
import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const PlatformsScreen = ({
	navigation,
}: NativeStackScreenProps<
	RootStackParamList,
	"Platforms"
>): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	return (
		<ScreenContainer>
			<GlassCard>
				<SimpleEntityForm
					onSave={async (name) => {
						await platformService.savePlatform(database, name);
						refreshData();
						navigation.goBack();
					}}
				/>
			</GlassCard>
		</ScreenContainer>
	);
};

export default PlatformsScreen;
