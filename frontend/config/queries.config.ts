export const DELETE_USER = `DELETE FROM user;`;

export const INSERT_USER = `INSERT INTO user (id, name) VALUES (?, ?);`;

export const SELECT_USERS = `SELECT * from user;`;

export const SELECT_SOURCES = `SELECT * FROM source WHERE userId=?;`;

export const INSERT_SOURCE = `INSERT INTO source (id, userId, name, initialAmount, currentAmount) VALUES (?, ?, ?, ?, ?);`;