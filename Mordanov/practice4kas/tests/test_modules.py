import unittest 
import main

class testTodoList(unittest.TestCase):
    def setUp(self):
        self.TodoListTest = main.TodoList()

    def test_add_task(self):
        self.TodoListTest.add_task("Тест")
        self.assertIn("Тест",self.TodoListTest.get_tasks())

    def test_remove_task(self):
        self.TodoListTest.add_task("Тест")
        self.TodoListTest.remove_task("Тест")
        self.assertNotIn("Тест",self.TodoListTest.get_tasks())

    def test_get_tasks(self):
        self.TodoListTest.add_task("Тест")
        self.assertIn("Тест",self.TodoListTest.get_tasks())