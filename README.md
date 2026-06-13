# Relog

관계별 사건, 대화, 감정과 행동을 기록하고 시간 흐름과 기본 통계를 확인하는 MVP입니다.

## Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

기본 DB는 `backend/relog.db` SQLite 파일입니다. PostgreSQL에서는 `.env.example`을 참고해 `DATABASE_URL`을 설정하세요.

## Frontend (Next.js App Router)

```powershell
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열고 회원가입 후 사용합니다.

프론트엔드는 같은 출처의 Next.js Route Handler를 BFF로 사용합니다. JWT는 브라우저 저장소에 두지 않고 `HttpOnly`, `SameSite=Lax` 쿠키에 저장되며, Next 서버만 FastAPI에 Bearer 토큰을 전달합니다.

## Test

```powershell
cd backend
pytest

cd ../frontend
npm run build
npm run lint
```
