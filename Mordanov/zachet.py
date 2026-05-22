import unittest
def average(lst):
    if not isinstance(lst, list):
        raise ValueError("Аргумент-Список")
    if not lst:
        raise ValueError("Заполни")
    return sum(lst) / len(lst)

class TestAverage(unittest.TestCase):
    def test_normal(self):
        self.assertEquale(average([1, 2, 3]), 2)
    
    def test_empty(self):
        with self.assertRaises(ValueError):
            average([])

    def test_alter(self):
        self.assertEquale(average([-1, -2, -3]), -2)

    def test_not_list(self):
        with self.assertRaises(ValueError):
            average("Не")

    if __name__ == '__main__':
        unittest.main()