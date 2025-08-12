from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth
from ..ai import get_ai_response

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)

@router.get("/{debate_id}", response_model=schemas.Analysis)
def get_analysis(debate_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    messages = db.query(models.Message).filter(models.Message.debate_id == debate_id).all()

    prompt = "The following is a transcript of a debate. Please provide an analysis of the debate, including the strengths and weaknesses of each debater's arguments.\n\n"
    for message in messages:
        prompt += f"{message.sender.username if message.sender else 'AI'}: {message.content}\n"

    analysis = get_ai_response(prompt)

    return {"analysis": analysis}
