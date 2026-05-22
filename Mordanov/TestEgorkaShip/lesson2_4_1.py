from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import math

driver = webdriver.Chrome()

try:
    driver.get("http://suninjuly.github.io/explicit_wait2.html")
    
    WebDriverWait(driver, 12).until(
        EC.text_to_be_present_in_element((By.ID, "price"), "$100")
    )
    
    driver.find_element(By.ID, "book").click()
    
    x = int(driver.find_element(By.ID, "input_value").text)
    answer =  math.log(abs(12 * math.sin(x)))
    driver.find_element(By.ID, "answer").send_keys(answer)
    
    driver.find_element(By.ID, "solve").click()
    time.sleep(20)

finally:
    driver.quit()
