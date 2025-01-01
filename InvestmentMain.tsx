import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CustomText from "./CustomText";
import IInvestment from "./IInvestment";
import InvestmentAnalysis from "./InvestementAnalysis";
import InvestmentRenderItem from "./InvestmentRenderItem";
import useInvestmentService from "./InvestmentService";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";

const InvestmentMain = () => {
	const { fetchInvestments } = useInvestmentService();
	const [investments, setInvestments] = useState<null | IInvestment[]>(null);

	useFocusEffect(useCallback(() => setInvestments(fetchInvestments()), []));

	return (
		<ScreenLayout>
			{investments && investments.length > 0 ? (
				<>
					<InvestmentAnalysis investments={investments} />
					<FlatList
						data={investments}
						renderItem={InvestmentRenderItem}
					/>
				</>
			) : (
				<CustomText
					text={"No Sources found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
		</ScreenLayout>
	);
};

export default InvestmentMain;
