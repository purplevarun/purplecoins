import {
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";

const UsernameInput = () => {
	const { usernameValue, setUsernameValue } = useContext(LoginContext);
	const width = usernameValue.length >= 10 ? "300px" : "250px";
	return (
		<input
			type="text"
			placeholder="username"
			value={usernameValue}
			onChange={(event) => setUsernameValue(event.target.value)}
			minLength={USERNAME_MIN_LENGTH}
			maxLength={USERNAME_MAX_LENGTH}
			style={{
				display: "flex",
				width,
				fontSize: "30px",
				padding: "5px 20px",
				border: "none",
				borderRadius: "10px",
				outline: "none",
				transition: "1s",
			}}
		/>
	);
};
export default UsernameInput;
