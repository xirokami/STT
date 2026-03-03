print('\n',"6 Вариант"'\n')
class TodoList:
    List = []
    def add_task(self,task):
        self.List.append(task)
    def remove_task(self,task):
        self.List.remove(task)
    def get_tasks(self):
        return self.List
    
list1 = TodoList()
list1.add_task("basketball")
list1.add_task("volleyball")
list1.remove_task("basketball")
print(list1.get_tasks())

print('\n',"7 Вариант"'\n')

class StringManipulator:
    def reversed_string(self,string):
        return string[::-1]
    def to_uppercase(self,string):
        return string.upper()
    def to_lowercase(self,string):
        return string.lower()
otv = StringManipulator()

print (otv.to_lowercase("STRING"))
print (otv.to_uppercase("string"))
print (otv.reversed_string("string"))
    