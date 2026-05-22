from selenium import webdriver
from selenium.webdriver.common.by import By
import math
import time

def calc(x):
    return str(math.log(abs(12 * math.sin(int(x)))))

browser = webdriver.Chrome()  

try:
    browser.get("https://suninjuly.github.io/get_attribute.html")

    x = browser.find_element(By.CSS_SELECTOR, "#treasure")

    x = x.get_attribute("valuex") 

    y = calc(x)

    answer_input = browser.find_element(By.CSS_SELECTOR, "#answer")  
    answer_input.send_keys(y)

    checkbox = browser.find_element(By.CSS_SELECTOR, "#robotCheckbox")
    checkbox.click()

    radiobutton = browser.find_element(By.CSS_SELECTOR, "#robotsRule") 
    radiobutton.click()

    submit_button = browser.find_element(By.CSS_SELECTOR, ".btn.btn-default")  
    submit_button.click()

    time.sleep(5)

finally:
    browser.quit()
