import { CSSProperties, ReactNode } from "react";

const Layout = ({
	children,
	extraStyles,
}: {
	children: ReactNode;
	extraStyles?: CSSProperties;
}) => {
	return (
		<div id="layout" style={extraStyles}>
			{children}
		</div>
	);
};
export default Layout;
