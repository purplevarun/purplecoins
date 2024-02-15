import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import Vertical from "../../../common_components/Vertical.tsx";

const LoginScreenMessage = () => {
	const { loginScreenText } = useContext(LoginContext);
	const msgSplit = loginScreenText.split("&&");
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{msgSplit.map((msg, index) => (
				<h3 key={index}>{msg}</h3>
			))}
			<Vertical h={1.5} />
		</div>
	);
};
export default LoginScreenMessage;
