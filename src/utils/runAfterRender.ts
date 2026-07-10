const runAfterRender = (callback: () => void): (() => void) => {
	const timeoutId = setTimeout(callback, 0);
	return () => clearTimeout(timeoutId);
};

export default runAfterRender;
