import {
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";

const UsernameInput = () => {
	const { usernameValue, setUsernameValue } = useContext(LoginContext);
	const isUsernameLong = usernameValue.length >= USERNAME_MAX_LENGTH / 2;
	const width = isUsernameLong ? "300px" : "250px";
	return (
		<input
			type="text"
			placeholder="username"
			id="username_input"
			value={usernameValue}
			onChange={(event) => setUsernameValue(event.target.value)}
			minLength={USERNAME_MIN_LENGTH}
			maxLength={USERNAME_MAX_LENGTH}
			style={{
				display: "flex",
				width,
			}}
		/>
	);
};
export default UsernameInput;
