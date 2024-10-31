import ScreenLayout from "../../components/ScreenLayout";
import Vertical from "../../components/Vertical";
import ProviderType from "../../types/ProviderType";

const AuthScreenLayout: ProviderType = ({ children }) => {
	return (
		<ScreenLayout>
			<Vertical size={40} />
			{children}
		</ScreenLayout>
	);
};

export default AuthScreenLayout;
