import unittest 
import main

class testStringManipulator(unittest.TestCase):
    def setUp(self):
        self.StringManipTest = main.StringManipulator()
    def test_reverse(self):
        self.assertEqual(self.StringManipTest.reversed_string("Плюмбус"),"субмюлП")
    def test_uppercase(self):
        self.assertEqual(self.StringManipTest.to_uppercase("шапочка"),"ШАПОЧКА")
    def test_lowercase(self):
        self.assertEqual(self.StringManipTest.to_lowercase("МЕГАЗУМ"),"мегазум")
