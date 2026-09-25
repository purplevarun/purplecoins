const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred.";
};

export default getErrorMessage;
