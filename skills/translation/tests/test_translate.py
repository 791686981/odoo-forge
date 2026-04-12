import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "translate.py"


def load_translate_module():
    spec = importlib.util.spec_from_file_location("odoo_tool_translate", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class TranslateScriptTests(unittest.TestCase):
    def setUp(self):
        self.module = load_translate_module()

    def run_main(self, argv, payload):
        stdout = io.StringIO()
        with mock.patch.object(self.module.httpx, "post", return_value=FakeResponse(payload)):
            with mock.patch("sys.argv", ["translate.py", *argv]):
                with redirect_stdout(stdout):
                    self.module.main()
        return json.loads(stdout.getvalue())

    def test_default_output_uses_language_po_filename(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            pot_path = Path(tmpdir) / "crm_timesheet" / "i18n" / "crm_timesheet.pot"
            pot_path.parent.mkdir(parents=True)
            pot_path.write_text(
                'msgid ""\n'
                'msgstr ""\n'
                '"Language: en_US\\n"\n'
                "\n"
                'msgid "Timesheet"\n'
                'msgstr ""\n',
                encoding="utf-8",
            )

            result = self.run_main(
                [str(pot_path), "--target-language", "zh_CN"],
                {
                    "content": (
                        'msgid ""\n'
                        'msgstr ""\n'
                        '"Language: zh_CN\\n"\n'
                        "\n"
                        'msgid "Timesheet"\n'
                        'msgstr "工时表"\n'
                    ),
                    "total_entries": 1,
                    "translated_entries": 1,
                    "proofread_applied": 0,
                },
            )

            expected_path = pot_path.parent / "zh_CN.po"
            self.assertEqual(result["output_path"], str(expected_path))
            self.assertTrue(expected_path.exists())
            self.assertEqual(expected_path.read_text(encoding="utf-8").count("工时表"), 1)
            self.assertTrue(result["validation"]["filename_matches_language"])

    def test_validation_reports_translation_artifact_problems(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            po_path = Path(tmpdir) / "demo" / "i18n" / "zh_CN.po"
            po_path.parent.mkdir(parents=True)
            po_path.write_text(
                'msgid ""\n'
                'msgstr ""\n'
                '"Language: zh_CN\\n"\n',
                encoding="utf-8",
            )

            result = self.run_main(
                [str(po_path), "--target-language", "zh_CN"],
                {
                    "content": (
                        'msgid ""\n'
                        'msgstr ""\n'
                        '"Language: fr_FR\\n"\n'
                        "\n"
                        '#, fuzzy\n'
                        'msgid "Hello %s"\n'
                        'msgstr ""\n'
                        "\n"
                        'msgid "<b>Bold</b>"\n'
                        'msgstr "<b>粗体"\n'
                    ),
                    "total_entries": 2,
                    "translated_entries": 1,
                    "proofread_applied": 0,
                },
            )

            validation = result["validation"]
            self.assertFalse(validation["language_header_correct"])
            self.assertEqual(validation["empty_msgstr_count"], 1)
            self.assertEqual(validation["fuzzy_count"], 1)
            self.assertGreaterEqual(validation["placeholder_mismatch_count"], 1)
            self.assertGreaterEqual(validation["markup_mismatch_count"], 1)
            self.assertFalse(validation["passed"])


if __name__ == "__main__":
    unittest.main()
