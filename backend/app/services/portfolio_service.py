from sqlalchemy.orm import Session
from app.models.user import User
from app.models.resume import Resume
from app.models.portfolio import Portfolio


def get_or_create_user(db: Session, username: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user
    user = User(username=username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save_resume(db: Session, user_id: int, resume_json: dict, raw_text: str | None = None) -> Resume:
    resume = db.query(Resume).filter(Resume.user_id == user_id).first()
    if resume:
        resume.parsed_json = resume_json
        resume.raw_text = raw_text
    else:
        resume = Resume(user_id=user_id, parsed_json=resume_json, raw_text=raw_text)
        db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def deploy_portfolio(db: Session, username: str, template: str, resume_json: dict) -> Portfolio:
    user = get_or_create_user(db, username)
    portfolio = db.query(Portfolio).filter(Portfolio.username == username).first()
    if portfolio:
        portfolio.template = template
        portfolio.resume_json = resume_json
        portfolio.is_public = True
    else:
        portfolio = Portfolio(user_id=user.id, username=username, template=template, resume_json=resume_json, is_public=True)
        db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def get_portfolio(db: Session, username: str) -> Portfolio | None:
    return db.query(Portfolio).filter(Portfolio.username == username, Portfolio.is_public == True).first()
