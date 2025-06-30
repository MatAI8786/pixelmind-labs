import re
import unittest
from tools.file_utils import safe_timestamp


class TestSafeTimestamp(unittest.TestCase):
    def test_format(self):
        ts = safe_timestamp()
        self.assertNotIn(":", ts)
        self.assertRegex(ts, r"\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{6}")


if __name__ == "__main__":
    unittest.main()
