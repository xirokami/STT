import unittest
def is_palindrome(s):
    if not isinstance(s, str):
        raise ValueError("Входные данные должны быть строкой")
    s = s.replace(" ", "").lower()  # Убираем пробелы и приводим к нижнему регистру
    return s == s[::-1]

class testPalindrom(unittest.TestCase):
    def test_DefaultCase(self):
        self.assertTrue(is_palindrome("казак"))
    
    def test_EmptyCase(self):
        self.assertTrue(is_palindrome(""))

    def test_HardCase(self):
        self.assertTrue(is_palindrome("Я иду с мечем Судия"))

    def test_number(self):
        with self.assertRaises(ValueError):
            is_palindrome(1)

if __name__ == '__main__':
    unittest.main() 