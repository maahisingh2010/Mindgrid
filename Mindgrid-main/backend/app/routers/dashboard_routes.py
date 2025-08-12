from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats", response_model=schemas.UserStats)
def get_user_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    debates_won = db.query(models.Debate).filter(models.Debate.winner == current_user.username).count()
    debates_lost = db.query(models.Debate).filter(models.Debate.winner != current_user.username, models.Debate.winner != 'draw').count()
    debates_competed = db.query(models.Debate).filter(models.Debate.user_id == current_user.id).count()

    return {
        "debates_won": debates_won,
        "debates_lost": debates_lost,
        "debates_competed": debates_competed
    }

@router.get("/history", response_model=list[schemas.DebateOut])
def get_user_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Debate).filter(models.Debate.user_id == current_user.id).order_by(models.Debate.timestamp.desc()).limit(10).all()
