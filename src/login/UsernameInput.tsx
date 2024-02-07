import {
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../constants/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.ts";

type EventType = { target: { value: string } };
const UsernameInput = () => {
	const { usernameValue, setUsernameValue } = useContext(LoginContext);
	const width = usernameValue.length >= 10 ? "300px" : "250px";
	const handleChange = (event: EventType) =>
		setUsernameValue(event.target.value);

	return (
		<input
			type="text"
			placeholder="username"
			value={usernameValue}
			onChange={handleChange}
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
