import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    text_chunks: list[str] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text_chunks.append(page.extract_text() or "")
    return "\n".join(text_chunks).strip()
