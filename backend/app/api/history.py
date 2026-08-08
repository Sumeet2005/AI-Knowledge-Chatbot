from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import (
    ConversationHistoryResponse,
    ConversationSummaryResponse,
)
from app.services.history import HistoryService

router = APIRouter(
    prefix="",
    tags=["History"],
)


@router.get(
    "/history",
    response_model=list[ConversationSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all conversations",
)
def get_history(
    db: Session = Depends(get_db),
) -> list[ConversationSummaryResponse]:
    """
    Return all conversations.
    """

    history_service = HistoryService(db)

    return history_service.get_all_conversations()


@router.get(
    "/history/{conversation_id}",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get conversation history",
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
) -> ConversationHistoryResponse:
    """
    Return one conversation.
    """

    history_service = HistoryService(db)

    conversation = history_service.get_conversation(
        conversation_id
    )

    if conversation is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return conversation


from fastapi.responses import StreamingResponse
import io
import html
from datetime import datetime

# Helper to generate TXT
def generate_txt_export(conversation_id: int, messages: list, exported_at_str: str) -> io.BytesIO:
    buffer = io.BytesIO()
    lines = [
        f"Conversation Export - Thread #{conversation_id}",
        f"Exported on: {exported_at_str}",
        "=" * 50,
        ""
    ]
    for msg in messages:
        role_label = "USER" if msg.role == "user" else "ASSISTANT"
        time_str = msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        lines.append(f"[{time_str}] {role_label}:")
        lines.append(msg.content or "")
        lines.append("-" * 50)
        lines.append("")
    
    buffer.write("\n".join(lines).encode("utf-8"))
    buffer.seek(0)
    return buffer

# Helper to generate Markdown
def generate_markdown_export(conversation_id: int, messages: list, exported_at_str: str) -> io.BytesIO:
    buffer = io.BytesIO()
    lines = [
        f"# Conversation Export - Thread #{conversation_id}",
        "",
        f"**Exported on:** {exported_at_str}",
        "",
        "---",
        ""
    ]
    for msg in messages:
        role_label = "User" if msg.role == "user" else "Assistant"
        time_str = msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        lines.append(f"### **{role_label}** - *{time_str}*")
        lines.append("")
        lines.append(msg.content or "")
        lines.append("")
        lines.append("---")
        lines.append("")
    
    buffer.write("\n".join(lines).encode("utf-8"))
    buffer.seek(0)
    return buffer

# Helper to clean text for standard Helvetica font in PDF
def clean_pdf_text(text: str) -> str:
    if not text:
        return ""
    # Convert to latin-1 and back, replacing unsupported unicode characters with '?'
    return text.encode('latin-1', errors='replace').decode('latin-1')

# Helper to generate PDF using ReportLab
def generate_pdf_export(conversation_id: int, messages: list, exported_at_str: str) -> io.BytesIO:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=20
    )
    
    user_header_style = ParagraphStyle(
        'UserHeader',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0891b2'),
        spaceBefore=10,
        spaceAfter=4
    )

    assistant_header_style = ParagraphStyle(
        'AssistantHeader',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#059669'),
        spaceBefore=10,
        spaceAfter=4
    )
    
    msg_body_style = ParagraphStyle(
        'MsgBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=12
    )

    story = []
    
    story.append(Paragraph(f"Conversation Export - Thread #{conversation_id}", title_style))
    story.append(Paragraph(f"Exported on: {exported_at_str}", meta_style))
    
    for msg in messages:
        role_label = "USER" if msg.role == "user" else "ASSISTANT"
        header_style = user_header_style if msg.role == "user" else assistant_header_style
        time_str = msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        
        story.append(Paragraph(f"<b>{role_label}</b> &nbsp;&nbsp;<font color='#94a3b8'>{time_str}</font>", header_style))
        
        text = msg.content or ""
        cleaned_text = clean_pdf_text(text)
        escaped_text = html.escape(cleaned_text)
        html_text = escaped_text.replace('\n', '<br/>')
        story.append(Paragraph(html_text, msg_body_style))
        story.append(Spacer(1, 8))
        
    doc.build(story)
    buffer.seek(0)
    return buffer

@router.get(
    "/history/{conversation_id}/export",
    summary="Export conversation history",
)
def export_conversation(
    conversation_id: int,
    format: str = "txt",
    db: Session = Depends(get_db),
):
    """
    Export one conversation's history as TXT, Markdown, or PDF.
    """
    history_service = HistoryService(db)
    
    # Retrieve conversation metadata
    conversation = history_service.conversation_service.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
        
    # Get all messages
    messages = history_service.conversation_service.get_messages(conversation_id)
    
    fmt = format.lower().strip()
    if fmt not in ("txt", "text", "md", "markdown", "pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported export format. Supported formats are: txt, markdown (md), pdf.",
        )
        
    exported_at_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    if fmt in ("pdf",):
        try:
            pdf_buffer = generate_pdf_export(conversation_id, messages, exported_at_str)
            return Response(
                content=pdf_buffer.getvalue(),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="conversation_{conversation_id}.pdf"'
                }
            )
        except Exception as exc:
            import traceback
            try:
                from app.config import logger
                logger.error(f"PDF generation failed: {exc}\n{traceback.format_exc()}")
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF: {str(exc)}"
            )
            
    elif fmt in ("md", "markdown"):
        md_buffer = generate_markdown_export(conversation_id, messages, exported_at_str)
        return Response(
            content=md_buffer.getvalue(),
            media_type="text/markdown; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="conversation_{conversation_id}.md"'
            }
        )
    else:
        txt_buffer = generate_txt_export(conversation_id, messages, exported_at_str)
        return StreamingResponse(
            txt_buffer,
            media_type="text/plain",
            headers={
                "Content-Disposition": f'attachment; filename="conversation_{conversation_id}.txt"'
            }
        )