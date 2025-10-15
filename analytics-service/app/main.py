from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Query
from app.routers import ingress, reports, flags, datasources, scheduler, run  # ← NEW
from app.tasks.scheduler import start_scheduler
from app.deps import verify_key  # ← use the shared one
from contextlib import asynccontextmanager

# Define the WebSocket endpoint
socket_router = APIRouter()

@socket_router.get("/socket.io")
def socketio_endpoint(orgId: str = Query(...)):
    return {"status": "ok"}

# Define the lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

# Initialize the FastAPI application
app = FastAPI(title="MutSyncHub Analytics Engine", version="2.2", lifespan=lifespan)

# Define allowed origins for CORS
origins = [
    "https://potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev",
    "http://localhost:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the WebSocket router
app.include_router(socket_router, tags=["socket"])

# Include other routers with dependencies
app.include_router(datasources.router, dependencies=[Depends(verify_key)])  # ← NEW
app.include_router(reports.router, dependencies=[Depends(verify_key)])
app.include_router(flags.router, dependencies=[Depends(verify_key)])
app.include_router(scheduler.router, dependencies=[Depends(verify_key)])
app.include_router(run.router, dependencies=[Depends(verify_key)])

# Public health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}