import Layout from "../layout/Layout.tsx";
import { useState } from "react";
import {
	API_URL,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../constants/Constants.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Event = { target: { value: string } };
const Username = () => {
	const navigate = useNavigate();
	const [usernameValue, setUsernameValue] = useState("");
	const [fetchUserApiCalled, setFetchUserApiCalled] = useState(false);
	const handleChange = () => (event: Event) =>
		setUsernameValue(event.target.value);
	const isUsernameLengthEnough = () =>
		usernameValue.length >= USERNAME_MIN_LENGTH;
	const handleClick = async () => {
		axios
			.get(`${API_URL}/user?userName=${usernameValue}`)
			.then((response) => {
				if (
					response.status === 200 &&
					response.data.message === "User exists"
				) {
					setFetchUserApiCalled(false);
					navigate("/");
				}
			})
			.catch(() => {
				setFetchUserApiCalled(true);
			});
	};
	return (
		<Layout extraStyles={{ alignItems: "center" }}>
			<div style={{ height: "28vh" }} />
			{fetchUserApiCalled && (
				<h3 style={{ position: "absolute", top: "34vh" }}>
					user does not exist
				</h3>
			)}
			<input
				type="text"
				placeholder="username"
				value={usernameValue}
				onChange={handleChange()}
				minLength={USERNAME_MIN_LENGTH}
				maxLength={USERNAME_MAX_LENGTH}
				style={{
					display: "flex",
					width: usernameValue.length > 10 ? "300px" : "250px",
					fontSize: "30px",
					padding: "5px 20px",
					border: "none",
					borderRadius: "10px",
					outline: "none",
					transition: "1s",
				}}
			/>
			<div style={{ height: "5vh" }} />
			{isUsernameLengthEnough() && (
				<button style={{ fontSize: "30px" }} onClick={handleClick}>
					proceed
				</button>
			)}
		</Layout>
	);
};
export default Username;
