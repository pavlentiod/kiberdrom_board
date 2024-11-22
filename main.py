import json

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.responses import RedirectResponse, FileResponse

from src.files_router import files_router

app = FastAPI()



@app.get("/show", response_class=RedirectResponse)
def get_board():
    return FileResponse("src/board.html")

@app.get("/admin", response_class=RedirectResponse)
def get_admin():
    return FileResponse("src/admin.html")


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)},
    )

app.include_router(router=files_router)

origins = ["http://localhost:63342"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, port=8013)
