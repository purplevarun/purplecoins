import { CSSProperties, ReactNode } from "react";

const Layout = ({
	children,
	extraStyles,
}: {
	children: ReactNode;
	extraStyles?: CSSProperties;
}) => {
	return (
		<form
			autoComplete="off"
			id="layout"
			style={{ ...extraStyles }}
			onSubmit={(event) => event.preventDefault()}
		>
			{children}
		</form>
	);
};
export default Layout;
