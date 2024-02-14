import { BrowserRouter } from "react-router-dom";
import CustomRouter from "../router/CustomRouter.tsx";
import AuthContextProvider from "../../context/auth/AuthContextProvider.tsx";

const Application = () => {
	return (
		<AuthContextProvider>
			<BrowserRouter basename={"/purplecoins"}>
				<CustomRouter />
			</BrowserRouter>
		</AuthContextProvider>
	);
};
export default Application;
