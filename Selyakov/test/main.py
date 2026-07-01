from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")


@app.get("/")
def root():
    return FileResponse("index.html")


@app.get("/log")
def log_page():
    return FileResponse("log.html")


@app.get("/zaya")
def zaya_page():
    return FileResponse("zaya.html")

@app.get("/fzaya")
def fzaya_page():
    return FileResponse("fzaya.html")

@app.get("/ada")
def ada_page():
    return FileResponse("ada.html")