import { FaUser, FaUserSlash } from "react-icons/fa6";
import { useContext } from "react";
import AuthContext from "../main/AuthContext.tsx";

const Header = () => {
	const { loggedInUserName } = useContext(AuthContext);
	return (
		<div id="header">
			<h1 style={{ paddingLeft: "20px", color: "purple" }}>
				purplecoins
			</h1>
			{loggedInUserName === null ? (
				<FaUserSlash style={{ paddingRight: "20px" }} size={40} />
			) : (
				<FaUser style={{ paddingRight: "20px" }} size={40} />
			)}
		</div>
	);
};
export default Header;
