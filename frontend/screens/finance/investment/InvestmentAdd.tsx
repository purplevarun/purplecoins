import {
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
	MINIMUM_LENGTH
} from "../../../config/constants.config";
import InvestmentRoutes from "./InvestmentRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import Vertical from "../../../components/Vertical";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import useInvestmentStore from "./InvestmentStore";
import useInvestmentService from "./InvestmentService";

const InvestmentAdd = () => {
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		currentAmount,
		setCurrentAmount
	} = useInvestmentStore();
	const { addNewInvestment } = useInvestmentService();

	return (
		<ScreenLayout>
			<CloseButton path={InvestmentRoutes.Main} />
			<Vertical />
			<CustomText
				text={"Add Investment"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={MARGIN} />
			<CustomInput
				name={"Name"}
				value={name}
				setValue={setName}
				required
			/>
			<CustomInput
				name={"Invested Amount"}
				value={investedAmount}
				setValue={setInvestedAmount}
				numeric
			/>
			<CustomInput
				name={"Current Amount"}
				value={currentAmount}
				setValue={setCurrentAmount}
				numeric
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={addNewInvestment}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
