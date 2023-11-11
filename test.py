from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager
from starlette.websockets import WebSocket
import asyncio


@asynccontextmanager
def lifespan(app: FastAPI):
    # Register the asynchronous startup task
    asyncio.create_task(my_async_startup_task())
    print("===========================")
    yield


app = FastAPI(lifespan=lifespan)


async def my_async_startup_task():
    await asyncio.sleep(2)  # Simulating an asynchronous operation
    print("Running asynchronous task during startup")
    # Add your asynchronous startup code here


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
