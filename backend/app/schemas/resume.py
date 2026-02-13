from pydantic import BaseModel, Field


class Personal(BaseModel):
    name: str
    title: str
    summary: str
    # `photo` remains for compatibility with existing stored payloads.
    photo: str = ""
    primaryPhoto: str = ""
    secondaryPhoto: str = ""


class Contact(BaseModel):
    email: str
    phone: str
    location: str


class Links(BaseModel):
    github: str = ""
    linkedin: str = ""
    twitter: str = ""
    portfolio: str = ""


class Experience(BaseModel):
    company: str
    role: str
    startDate: str
    endDate: str
    description: str


class Project(BaseModel):
    name: str
    description: str
    tech: list[str] = Field(default_factory=list)
    link: str = ""


class ResumeData(BaseModel):
    personal: Personal
    contact: Contact
    links: Links
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
