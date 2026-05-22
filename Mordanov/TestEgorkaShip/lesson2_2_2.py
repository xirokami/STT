from selenium import webdriver
from selenium.webdriver.common.by import By
import math
import time

driver = webdriver.Chrome()

try:
    driver.get("https://SunInJuly.github.io/execute_script.html")

    x_element = driver.find_element(By.ID, "input_value")
    x = int(x_element.text)

    result = str(math.log(abs(12 * math.sin(x))))

    driver.execute_script("window.scrollBy(0, 200);") 

    answer_input = driver.find_element(By.ID, "answer")
    answer_input.send_keys(result)

    robot_checkbox = driver.find_element(By.ID, "robotCheckbox")
    robot_checkbox.click()

    robots_rule_radio = driver.find_element(By.ID, "robotsRule")
    robots_rule_radio.click()

    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")  

    submit_button = driver.find_element(By.CSS_SELECTOR, "button.btn")
    driver.execute_script("arguments[0].click();", submit_button)

    time.sleep(30)

    alert = driver.switch_to.alert.text
    print(alert.split()[-1])  
    alert.accept() 

finally:
    driver.quit()
