import json

from fastapi import APIRouter
from starlette.responses import FileResponse, RedirectResponse

files_router = APIRouter(tags=["Files"])

@files_router.post("/")
async def upload(data: dict):
    with open("./data.json", "w", encoding="utf-8") as f:
        json.dump(data,f, indent=4)


@files_router.get("/{file}", response_class=RedirectResponse)
def get_file(file: str):
    return FileResponse(f"src/{file}")

@files_router.get("/styles/{file}", response_class=RedirectResponse)
def get_file(file: str):
    return FileResponse(f"src/styles/{file}")

@files_router.get("/graphics/{file}", response_class=RedirectResponse)
def get_file(file: str):
    return FileResponse(f"src/graphics/{file}")

@files_router.get("/data/{file}", response_class=RedirectResponse)
def get_file(file: str):
    return FileResponse(f"src/data/{file}")

@files_router.get("/")
def get_data():
    with open("./data.json", "r", encoding="utf-8") as f:
        return json.loads(f.read())