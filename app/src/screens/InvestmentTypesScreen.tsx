import GlassCard from "@/components/GlassCard";
import ScreenContainer from "@/components/ScreenContainer";
import SimpleEntityForm from "@/components/SimpleEntityForm";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import investmentTypeService from "@/services/investmentTypeService";
import type RootStackParamList from "@/types/RootStackParamList";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const InvestmentTypesScreen = ({
	navigation,
}: NativeStackScreenProps<
	RootStackParamList,
	"InvestmentTypes"
>): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	return (
		<ScreenContainer>
			<GlassCard>
				<SimpleEntityForm
					onSave={async (name) => {
						await investmentTypeService.saveInvestmentType(
							database,
							name,
						);
						refreshData();
						navigation.goBack();
					}}
				/>
			</GlassCard>
		</ScreenContainer>
	);
};

export default InvestmentTypesScreen;
