import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CustomRouter from "../router/CustomRouter.tsx";
import AuthContextProvider from "./context/AuthContextProvider.tsx";
import "../../styles/Styles.scss";

const app = (
	<AuthContextProvider>
		<BrowserRouter basename={"/purplecoins"}>
			<CustomRouter />
		</BrowserRouter>
	</AuthContextProvider>
);
ReactDOM.createRoot(document.getElementById("root")!).render(app);
