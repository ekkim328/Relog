from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import AIAnalysisReport, RelationshipLog, User
from ..schemas import AIAnalysisResponse, AIReportOut
from ..services import get_owned_relationship, get_owned_report


router = APIRouter(tags=["AI placeholder"])


@router.post("/relationships/{relationship_id}/ai-analysis", response_model=AIAnalysisResponse)
def request_analysis(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_owned_relationship(db, relationship_id, user)
    count, period_start, period_end = db.execute(
        select(
            func.count(RelationshipLog.log_id),
            func.min(RelationshipLog.log_date),
            func.max(RelationshipLog.log_date),
        ).where(RelationshipLog.relationship_id == relationship_id, RelationshipLog.user_id == user.user_id)
    ).one()
    if count < 10:
        return AIAnalysisResponse(
            eligible=False,
            message="아직 분석할 데이터가 충분하지 않습니다. 최소 10개 이상의 기록이 쌓이면 분석을 시작할 수 있습니다.",
        )
    report = AIAnalysisReport(
        relationship_id=relationship_id,
        user_id=user.user_id,
        period_start=period_start,
        period_end=period_end,
        summary="AI 분석 기능은 아직 준비 중입니다.",
        pattern_analysis="현재는 기록 데이터 저장과 기본 통계 분석 단계입니다.",
        risk_points="추후 AI 분석에서 관계 위험 신호를 분석할 예정입니다.",
        suggested_actions="현재는 타임라인과 감정 점수 변화를 먼저 확인하세요.",
        confidence_score=0,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return AIAnalysisResponse(eligible=True, report=report)


@router.get("/relationships/{relationship_id}/ai-reports", response_model=list[AIReportOut])
def list_reports(relationship_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_owned_relationship(db, relationship_id, user)
    return list(db.scalars(
        select(AIAnalysisReport)
        .where(AIAnalysisReport.relationship_id == relationship_id, AIAnalysisReport.user_id == user.user_id)
        .order_by(AIAnalysisReport.created_at.desc())
    ))


@router.get("/ai-reports/{report_id}", response_model=AIReportOut)
def get_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_owned_report(db, report_id, user)

