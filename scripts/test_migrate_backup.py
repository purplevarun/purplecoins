import sqlite3
import subprocess
import sys
import unittest
from contextlib import closing
from pathlib import Path
from tempfile import TemporaryDirectory

from migrate_backup import MIGRATIONS_PATH, MigrationError, migrate_backup


class MigrateBackupTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary_directory = TemporaryDirectory()
        self.addCleanup(temporary_directory.cleanup)
        self.directory = Path(temporary_directory.name)
        self.input_path = self.directory / "legacy.purplecoins"
        self.output_path = self.directory / "migrated.purplecoins"
        with closing(sqlite3.connect(self.input_path)) as database:
            database.executescript(
                """
                CREATE TABLE investments (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    archived INTEGER,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
                INSERT INTO investments VALUES ('investment-1', 'Savings', NULL, 1, 1);
                CREATE TABLE attachments (id TEXT PRIMARY KEY, content BLOB NOT NULL);
                INSERT INTO attachments VALUES ('attachment-1', X'000102FF');
                """
            )
        self.original_bytes = self.input_path.read_bytes()

    def assert_no_output(self) -> None:
        self.assertFalse(self.output_path.exists())
        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)
        self.assertEqual(list(self.directory.glob(".purplecoins-migration-*")), [])

    def test_migrates_legacy_backup_and_preserves_data(self) -> None:
        migrate_backup(self.input_path, self.output_path)

        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)
        with closing(sqlite3.connect(self.output_path)) as database:
            self.assertEqual(
                database.execute(
                    "SELECT id, name, label, investment_type_id, archived, "
                    "created_at, updated_at FROM investments;"
                ).fetchall(),
                [("investment-1", "Savings", None, None, None, 1, 1)],
            )
            self.assertEqual(
                database.execute("SELECT content FROM attachments;").fetchone(),
                (b"\x00\x01\x02\xff",),
            )
            self.assertEqual(
                database.execute("SELECT * FROM investment_types;").fetchall(), []
            )
            self.assertIsNotNone(
                database.execute(
                    "SELECT name FROM sqlite_master WHERE type = 'index' "
                    "AND name = 'idx_investments_type';"
                ).fetchone()
            )
            self.assertEqual(
                database.execute("PRAGMA journal_mode;").fetchone(), ("delete",)
            )
            self.assertEqual(
                database.execute("PRAGMA integrity_check;").fetchall(), [("ok",)]
            )
        self.assertEqual(list(self.directory.glob("*-wal")), [])
        self.assertEqual(list(self.directory.glob("*-shm")), [])

    def test_wal_mode_backup_produces_a_standalone_output(self) -> None:
        with closing(sqlite3.connect(self.input_path)) as database:
            database.execute("PRAGMA journal_mode = WAL;")
            database.execute(
                "INSERT INTO investments VALUES "
                "('investment-2', 'Retirement', NULL, 2, 2);"
            )
            database.commit()
        self.original_bytes = self.input_path.read_bytes()

        migrate_backup(self.input_path, self.output_path)

        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)
        with closing(sqlite3.connect(self.output_path)) as database:
            self.assertEqual(
                database.execute("PRAGMA journal_mode;").fetchone(), ("delete",)
            )
            self.assertEqual(
                database.execute("SELECT name FROM investments ORDER BY id;").fetchall(),
                [("Savings",), ("Retirement",)],
            )
        for suffix in ("-wal", "-shm", "-journal"):
            self.assertFalse(Path(f"{self.output_path}{suffix}").exists())

    def test_rejects_non_sqlite_backup(self) -> None:
        self.input_path.write_bytes(b"not a database")
        self.original_bytes = self.input_path.read_bytes()
        with self.assertRaisesRegex(MigrationError, "not a SQLite database"):
            migrate_backup(self.input_path, self.output_path)
        self.assert_no_output()

    def test_rejects_corrupt_sqlite_backup(self) -> None:
        self.input_path.write_bytes(b"SQLite format 3\x00" + b"invalid" * 100)
        self.original_bytes = self.input_path.read_bytes()
        with self.assertRaises(sqlite3.DatabaseError):
            migrate_backup(self.input_path, self.output_path)
        self.assert_no_output()

    def test_rejects_wrong_extension(self) -> None:
        with self.assertRaisesRegex(MigrationError, "extension"):
            migrate_backup(self.input_path, self.directory / "output.db")
        self.assert_no_output()

    def test_never_overwrites_existing_output(self) -> None:
        self.output_path.write_bytes(b"existing backup")
        with self.assertRaisesRegex(MigrationError, "already exists"):
            migrate_backup(self.input_path, self.output_path)
        self.assertEqual(self.output_path.read_bytes(), b"existing backup")
        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)

    def test_never_overwrites_input(self) -> None:
        with self.assertRaisesRegex(MigrationError, "already exists"):
            migrate_backup(self.input_path, self.input_path)
        self.assert_no_output()

    def test_failed_migration_discards_partial_changes(self) -> None:
        migration_path = self.directory / "failing.sql"
        migration_path.write_text(
            "BEGIN; ALTER TABLE investments ADD COLUMN label TEXT; "
            "INSERT INTO missing_table VALUES (1); COMMIT;",
            encoding="utf-8",
        )
        with self.assertRaises(sqlite3.OperationalError):
            migrate_backup(self.input_path, self.output_path, migration_path)
        self.assert_no_output()

    def test_already_migrated_backup_preserves_metadata(self) -> None:
        with closing(sqlite3.connect(self.input_path)) as database:
            database.executescript(MIGRATIONS_PATH.read_text(encoding="utf-8"))
            database.execute(
                "INSERT INTO investment_types VALUES ('type-1', 'Savings', 1, 1);"
            )
            database.execute(
                "UPDATE investments SET label = 'Emergency fund', "
                "investment_type_id = 'type-1';"
            )
            database.commit()
        self.original_bytes = self.input_path.read_bytes()
        migrate_backup(self.input_path, self.output_path)
        with closing(sqlite3.connect(self.output_path)) as database:
            self.assertEqual(
                database.execute(
                    "SELECT label, investment_type_id FROM investments;"
                ).fetchall(),
                [("Emergency fund", "type-1")],
            )
        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)

    def test_partially_migrated_backup_adds_missing_column(self) -> None:
        with closing(sqlite3.connect(self.input_path)) as database:
            database.execute("ALTER TABLE investments ADD COLUMN label TEXT;")
        self.original_bytes = self.input_path.read_bytes()
        migrate_backup(self.input_path, self.output_path)
        with closing(sqlite3.connect(self.output_path)) as database:
            self.assertEqual(
                database.execute(
                    "SELECT label, investment_type_id FROM investments;"
                ).fetchall(),
                [(None, None)],
            )
        self.assertEqual(self.input_path.read_bytes(), self.original_bytes)

    def test_uncommitted_migration_discards_output(self) -> None:
        migration_path = self.directory / "uncommitted.sql"
        migration_path.write_text(
            "BEGIN; ALTER TABLE investments ADD COLUMN label TEXT;",
            encoding="utf-8",
        )
        with self.assertRaisesRegex(MigrationError, "uncommitted transaction"):
            migrate_backup(self.input_path, self.output_path, migration_path)
        self.assert_no_output()

    def test_rejects_foreign_key_violations(self) -> None:
        with closing(sqlite3.connect(self.input_path)) as database:
            database.executescript(
                "CREATE TABLE linked_records (investment_id TEXT "
                "REFERENCES investments(id)); "
                "INSERT INTO linked_records VALUES ('missing-investment');"
            )
        self.original_bytes = self.input_path.read_bytes()
        with self.assertRaisesRegex(MigrationError, "foreign key check"):
            migrate_backup(self.input_path, self.output_path)
        self.assert_no_output()

    def test_command_line_writes_a_backup(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(Path(__file__).with_name("migrate_backup.py")),
                str(self.input_path),
                str(self.output_path),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(self.output_path.exists())
        self.assertIn("Migrated backup written to", result.stdout)


if __name__ == "__main__":
    unittest.main()