import {
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";

const UsernameInput = () => {
	const { usernameValue, setUsernameValue } = useContext(LoginContext);
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
				width:
					usernameValue.length >= USERNAME_MAX_LENGTH / 2
						? "300px"
						: "250px",
			}}
		/>
	);
};
export default UsernameInput;
