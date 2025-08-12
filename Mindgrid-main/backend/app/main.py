from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth_routes, leaderboard_routes, dashboard_routes, token_routes, gamification_routes, forum_routes, ai_debate_routes, analysis_routes
from . import debate, matchmaking
from .socketio_instance import sio
import socketio

# Define the list of allowed origins explicitly
origins = [
    "http://127.0.0.1:8080",
    "http://localhost:8080",
    "http://localhost:5173"
]

# Create FastAPI instance
fastapi_app = FastAPI()

# Enable CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log incoming requests for debugging
@fastapi_app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Include routers
fastapi_app.include_router(auth_routes.router)
fastapi_app.include_router(debate.router)
fastapi_app.include_router(leaderboard_routes.router)
fastapi_app.include_router(dashboard_routes.router)
fastapi_app.include_router(matchmaking.router)
fastapi_app.include_router(token_routes.router)
fastapi_app.include_router(gamification_routes.router)
fastapi_app.include_router(forum_routes.router)
fastapi_app.include_router(ai_debate_routes.router)
fastapi_app.include_router(analysis_routes.router)

# Combine Socket.IO and FastAPI into a single ASGI app
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
