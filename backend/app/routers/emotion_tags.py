from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import EmotionTag, User
from ..schemas import EmotionTagOut


router = APIRouter(prefix="/emotion-tags", tags=["emotion tags"])


@router.get("", response_model=list[EmotionTagOut])
def list_emotion_tags(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(EmotionTag).order_by(EmotionTag.category, EmotionTag.emotion_tag_id)))

