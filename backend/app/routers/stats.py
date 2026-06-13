from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import case, desc, func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Relationship, RelationshipLog, User
from ..schemas import DashboardRecentLog, DashboardRelationship, DashboardSummary, RelationshipStats
from ..services import get_owned_relationship


router = APIRouter(tags=["statistics"])


@router.get("/relationships/{relationship_id}/stats", response_model=RelationshipStats)
def relationship_stats(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    relationship = get_owned_relationship(db, relationship_id, user)
    today = date.today()
    base = [RelationshipLog.relationship_id == relationship_id, RelationshipLog.user_id == user.user_id]
    totals = db.execute(
        select(
            func.count(RelationshipLog.log_id),
            func.coalesce(func.avg(RelationshipLog.emotion_score), 0),
            func.sum(case((RelationshipLog.log_date >= today - timedelta(days=6), 1), else_=0)),
            func.sum(case((RelationshipLog.log_date >= today - timedelta(days=29), 1), else_=0)),
            func.sum(case((RelationshipLog.emotion_score > 0, 1), else_=0)),
            func.sum(case((RelationshipLog.emotion_score < 0, 1), else_=0)),
            func.sum(case((RelationshipLog.emotion_score == 0, 1), else_=0)),
            func.max(RelationshipLog.log_date),
        ).where(*base)
    ).one()
    common_event = db.execute(
        select(RelationshipLog.event_type, func.count(RelationshipLog.log_id).label("count"))
        .where(*base)
        .group_by(RelationshipLog.event_type)
        .order_by(desc("count"), RelationshipLog.event_type)
        .limit(1)
    ).first()
    return RelationshipStats(
        total_logs=totals[0] or 0,
        average_emotion_score=round(float(totals[1] or 0), 2),
        recent_7_days_logs=totals[2] or 0,
        recent_30_days_logs=totals[3] or 0,
        positive_logs=totals[4] or 0,
        negative_logs=totals[5] or 0,
        neutral_logs=totals[6] or 0,
        last_log_date=totals[7],
        most_common_event_type=common_event[0] if common_event else None,
        temperature_score=relationship.temperature_score,
    )


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    relationship_count = db.scalar(select(func.count(Relationship.relationship_id)).where(Relationship.user_id == user.user_id)) or 0
    log_totals = db.execute(
        select(
            func.count(RelationshipLog.log_id),
            func.coalesce(func.avg(RelationshipLog.emotion_score), 0),
            func.sum(case((RelationshipLog.log_date >= today - timedelta(days=6), 1), else_=0)),
            func.sum(case((RelationshipLog.log_date >= today - timedelta(days=29), 1), else_=0)),
        ).where(RelationshipLog.user_id == user.user_id)
    ).one()
    recent_rows = db.execute(
        select(RelationshipLog, Relationship.name)
        .join(Relationship, Relationship.relationship_id == RelationshipLog.relationship_id)
        .where(RelationshipLog.user_id == user.user_id)
        .order_by(RelationshipLog.log_date.desc(), RelationshipLog.created_at.desc())
        .limit(5)
    ).all()
    recent_logs = [DashboardRecentLog(
        log_id=log.log_id,
        relationship_id=log.relationship_id,
        relationship_name=name,
        log_date=log.log_date,
        title=log.title,
        event_type=log.event_type,
        emotion_score=log.emotion_score,
    ) for log, name in recent_rows]
    low_temp_rows = db.scalars(
        select(Relationship).where(Relationship.user_id == user.user_id).order_by(Relationship.temperature_score).limit(5)
    )
    low_temperature = [DashboardRelationship(
        relationship_id=item.relationship_id,
        name=item.name,
        temperature_score=item.temperature_score,
    ) for item in low_temp_rows if item.temperature_score < 50]
    negative_rows = db.execute(
        select(Relationship, func.count(RelationshipLog.log_id).label("negative_count"))
        .join(RelationshipLog, Relationship.relationship_id == RelationshipLog.relationship_id)
        .where(
            Relationship.user_id == user.user_id,
            RelationshipLog.emotion_score < 0,
            RelationshipLog.log_date >= today - timedelta(days=29),
        )
        .group_by(Relationship.relationship_id)
        .order_by(desc("negative_count"))
        .limit(5)
    ).all()
    return DashboardSummary(
        total_relationships=relationship_count,
        total_logs=log_totals[0] or 0,
        average_emotion_score=round(float(log_totals[1] or 0), 2),
        recent_7_days_logs=log_totals[2] or 0,
        recent_30_days_logs=log_totals[3] or 0,
        recent_logs=recent_logs,
        low_temperature_relationships=low_temperature,
        relationships_with_negative_logs=[DashboardRelationship(
            relationship_id=item.relationship_id,
            name=item.name,
            temperature_score=item.temperature_score,
            negative_log_count=count,
        ) for item, count in negative_rows],
    )

