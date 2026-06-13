from datetime import date

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user
from ..models import EmotionTag, RelationshipLog, User
from ..schemas import LogCreate, LogOut, LogUpdate
from ..services import get_owned_log, get_owned_relationship, resolve_emotion_tags


router = APIRouter(tags=["relationship logs"])


@router.get("/relationships/{relationship_id}/logs", response_model=list[LogOut])
def list_logs(
    relationship_id: int,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    start_date: date | None = None,
    end_date: date | None = None,
    event_type: str | None = None,
    emotion_category: str | None = None,
    keyword: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_owned_relationship(db, relationship_id, user)
    query = (
        select(RelationshipLog)
        .options(selectinload(RelationshipLog.emotion_tags))
        .where(RelationshipLog.relationship_id == relationship_id, RelationshipLog.user_id == user.user_id)
    )
    if start_date:
        query = query.where(RelationshipLog.log_date >= start_date)
    if end_date:
        query = query.where(RelationshipLog.log_date <= end_date)
    if event_type:
        query = query.where(RelationshipLog.event_type == event_type)
    if keyword:
        pattern = f"%{keyword}%"
        query = query.where(or_(RelationshipLog.title.ilike(pattern), RelationshipLog.content.ilike(pattern)))
    if emotion_category:
        query = query.join(RelationshipLog.emotion_tags).where(EmotionTag.category == emotion_category).distinct()
    query = query.order_by(RelationshipLog.log_date.desc(), RelationshipLog.created_at.desc()).offset((page - 1) * size).limit(size)
    return list(db.scalars(query).unique())


@router.post("/relationships/{relationship_id}/logs", response_model=LogOut, status_code=status.HTTP_201_CREATED)
def create_log(relationship_id: int, payload: LogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_owned_relationship(db, relationship_id, user)
    data = payload.model_dump(exclude={"emotion_tag_ids"})
    log = RelationshipLog(relationship_id=relationship_id, user_id=user.user_id, **data)
    log.emotion_tags = resolve_emotion_tags(db, payload.emotion_tag_ids)
    db.add(log)
    db.commit()
    return get_owned_log(db, log.log_id, user)


@router.get("/logs/{log_id}", response_model=LogOut)
def get_log(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_owned_log(db, log_id, user)


@router.patch("/logs/{log_id}", response_model=LogOut)
def update_log(log_id: int, payload: LogUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = get_owned_log(db, log_id, user)
    data = payload.model_dump(exclude_unset=True)
    if "emotion_tag_ids" in data:
        log.emotion_tags = resolve_emotion_tags(db, data.pop("emotion_tag_ids"))
    for key, value in data.items():
        setattr(log, key, value)
    db.commit()
    return get_owned_log(db, log_id, user)


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = get_owned_log(db, log_id, user)
    db.delete(log)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/relationships/{relationship_id}/timeline", response_model=list[LogOut])
def get_timeline(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_owned_relationship(db, relationship_id, user)
    query = (
        select(RelationshipLog)
        .options(selectinload(RelationshipLog.emotion_tags))
        .where(RelationshipLog.relationship_id == relationship_id, RelationshipLog.user_id == user.user_id)
        .order_by(RelationshipLog.log_date.asc(), RelationshipLog.created_at.asc())
    )
    return list(db.scalars(query))

