from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Response, status

from ..database import get_db
from ..deps import get_current_user
from ..models import Relationship, RelationshipLog, User
from ..schemas import RelationshipCreate, RelationshipListItem, RelationshipOut, RelationshipUpdate
from ..services import get_owned_relationship


router = APIRouter(prefix="/relationships", tags=["relationships"])


@router.get("", response_model=list[RelationshipListItem])
def list_relationships(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    recent_log = (
        select(RelationshipLog.relationship_id, func.max(RelationshipLog.log_date).label("recent_log_date"))
        .where(RelationshipLog.user_id == user.user_id)
        .group_by(RelationshipLog.relationship_id)
        .subquery()
    )
    rows = db.execute(
        select(Relationship, recent_log.c.recent_log_date)
        .outerjoin(recent_log, Relationship.relationship_id == recent_log.c.relationship_id)
        .where(Relationship.user_id == user.user_id)
        .order_by(Relationship.updated_at.desc())
    ).all()
    return [RelationshipListItem.model_validate(item).model_copy(update={"recent_log_date": recent}) for item, recent in rows]


@router.post("", response_model=RelationshipOut, status_code=status.HTTP_201_CREATED)
def create_relationship(payload: RelationshipCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    relationship = Relationship(user_id=user.user_id, **payload.model_dump())
    db.add(relationship)
    db.commit()
    db.refresh(relationship)
    return relationship


@router.get("/{relationship_id}", response_model=RelationshipOut)
def get_relationship(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_owned_relationship(db, relationship_id, user)


@router.patch("/{relationship_id}", response_model=RelationshipOut)
def update_relationship(relationship_id: int, payload: RelationshipUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    relationship = get_owned_relationship(db, relationship_id, user)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(relationship, key, value)
    db.commit()
    db.refresh(relationship)
    return relationship


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relationship(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    relationship = get_owned_relationship(db, relationship_id, user)
    db.delete(relationship)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

