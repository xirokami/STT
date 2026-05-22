import unittest

class StringManipulator:
    def __init__(self):
        pass
    def reversed_string(self,string):
        return string[::-1]
    def to_uppercase(self,string):
        return string.upper()
    def to_lowercase(self,string):
        return string.lower()

class testStringManipulator(unittest.TestCase):
    def setUp(self):
        self.StringManipTest = StringManipulator()
    def test_reverse(self):
        self.assertEqual(self.StringManipTest.reversed_string("Плюмбус"),"субмюелП")
    def test_uppercase(self):
        self.assertEqual(self.StringManipTest.to_uppercase("шапочка"),"ШАПОЧКА")
    def test_lowercase(self):
        self.assertEqual(self.StringManipTest.to_lowercase("МЕГАЗУМ"),"мегазум")
if __name__ == '__main__':
    unittest.main()

    