import argparse
import sqlite3
from contextlib import closing
from pathlib import Path
from tempfile import TemporaryDirectory

MIGRATIONS_PATH = Path(__file__).resolve().parents[1] / "migrations.sql"
BACKUP_EXTENSION = ".purplecoins"


class MigrationError(Exception):
    pass


def validate_database(database: sqlite3.Connection) -> None:
    if database.execute("PRAGMA integrity_check;").fetchall() != [("ok",)]:
        raise MigrationError("Database integrity check failed.")
    if database.execute("PRAGMA foreign_key_check;").fetchone() is not None:
        raise MigrationError("Database foreign key check failed.")


def apply_migrations(database: sqlite3.Connection, migration_sql: str) -> None:
    statement = ""
    for character in migration_sql:
        statement += character
        if character != ";" or not sqlite3.complete_statement(statement):
            continue
        try:
            database.execute(statement)
        except sqlite3.OperationalError as error:
            if not str(error).startswith("duplicate column name: "):
                raise
        statement = ""
    if statement.strip():
        database.execute(statement)
    if database.in_transaction:
        raise MigrationError("Migration SQL left an uncommitted transaction.")


def migrate_backup(
    input_path: Path,
    output_path: Path,
    migrations_path: Path = MIGRATIONS_PATH,
) -> None:
    input_path = input_path.resolve(strict=True)
    output_path = output_path.absolute()
    if any(
        path.suffix.lower() != BACKUP_EXTENSION for path in (input_path, output_path)
    ):
        raise MigrationError("Input and output must use the .purplecoins extension.")
    if output_path.exists() or output_path.is_symlink():
        raise MigrationError("Output already exists; choose a new output path.")
    with input_path.open("rb") as input_file:
        if input_file.read(16) != b"SQLite format 3\x00":
            raise MigrationError("The backup is not a SQLite database.")

    migration_sql = migrations_path.read_text(encoding="utf-8")
    with TemporaryDirectory(
        prefix=".purplecoins-migration-", dir=output_path.parent
    ) as temporary_directory:
        temporary_path = Path(temporary_directory) / "migrated.purplecoins"
        with (
            closing(
                sqlite3.connect(input_path.as_uri() + "?mode=ro", uri=True)
            ) as source_database,
            closing(sqlite3.connect(temporary_path)) as database,
        ):
            source_database.execute("PRAGMA trusted_schema = OFF;")
            validate_database(source_database)
            source_database.backup(database)
            database.execute("PRAGMA trusted_schema = OFF;")
            database.execute("PRAGMA foreign_keys = ON;")
            apply_migrations(database, migration_sql)
            validate_database(database)
            if database.execute("PRAGMA journal_mode = DELETE;").fetchone() != (
                "delete",
            ):
                raise MigrationError("Could not produce a standalone backup.")

        temporary_path.chmod(0o600)
        output_path.hardlink_to(temporary_path)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Apply migrations.sql to a copy of a PurpleCoins backup."
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    arguments = parser.parse_args()
    try:
        migrate_backup(arguments.input, arguments.output)
    except MigrationError as error:
        parser.exit(1, f"Migration failed: {error}\n")
    except (OSError, sqlite3.Error):
        parser.exit(
            1,
            "Migration failed. Check the backup, SQL, and output path. "
            "No output was published.\n",
        )
    print(f"Migrated backup written to {arguments.output}")


if __name__ == "__main__":
    main()