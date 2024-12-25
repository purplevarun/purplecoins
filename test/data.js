const date = new Date();
const day = String(date.getDate()).padStart(2, "0");
const month = String(date.getMonth() + 1).padStart(2, "0");
const year = date.getFullYear();
const todayDate = `${day}/${month}/${year % 100}`;

output.data = {
	todayDate: todayDate,
};
