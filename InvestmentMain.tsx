import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CustomText from "./CustomText";
import Header from "./Header";
import IInvestment from "./IInvestment";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";
import useInvestmentService from "./InvestmentService";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import useNavigate from "./useNavigate";

const InvestmentMain = () => {
	const { fetchInvestments } = useInvestmentService();
	const [investments, setInvestments] = useState<IInvestment[]>([]);
	useFocusEffect(useCallback(() => setInvestments(fetchInvestments()), []));
	const { navigateToInvestmentAdd } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Investments"}
				handlePlus={navigateToInvestmentAdd}
			/>
			{investments.length > 0 ? (
				<>
					<InvestmentAnalysis investments={investments} />
					<FlatList
						data={investments}
						renderItem={({ item }) => (
							<InvestmentRenderItem item={item} />
						)}
					/>
				</>
			) : (
				<CustomText
					text={"No Investments found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
		</ScreenLayout>
	);
};

export default InvestmentMain;
