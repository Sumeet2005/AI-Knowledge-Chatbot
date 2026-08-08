from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.orchestrator import ConversationOrchestratorService
from app.exceptions import GeminiException

router = APIRouter(
    prefix="",
    tags=["Chat"],
)


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question to the AI Knowledge Chatbot",
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    """
    Ask a question to the RAG chatbot.
    """

    import time
    from app.config import chat_telemetry, logger

    t_start = time.perf_counter()
    t_recv_end = time.perf_counter()
    telemetry_data = {
        "start_time": t_start,
        "stages": {
            "receive_request": (t_recv_end - t_start) * 1000.0,
            "query_rewriting": 0.0,
        }
    }
    chat_telemetry.set(telemetry_data)

    if request.stream:
        import queue
        import threading
        import json
        from fastapi.responses import StreamingResponse
        from app.config import status_callback_var

        q = queue.Queue()

        def status_callback(stage: str):
            q.put({"type": "status", "stage": stage})

        def run_pipeline():
            try:
                status_callback_var.set(status_callback)
                orchestrator = ConversationOrchestratorService(db)
                from app.monitoring.metrics import metrics_collector
                metrics_collector.increment_active()
                try:
                    res = orchestrator.chat(
                        question=request.question,
                        conversation_id=request.conversation_id,
                    )
                finally:
                    metrics_collector.decrement_active()
                
                # Persist aggregated metrics (reuse existing telemetry)
                try:
                    from app.monitoring.metrics import metrics_collector
                    from app.config import chat_telemetry
                    telemetry = chat_telemetry.get()
                    metrics_collector.record_success_from_telemetry(telemetry, db=db)
                except Exception:
                    pass

                q.put({"type": "final", "data": res.model_dump() if hasattr(res, "model_dump") else res.dict()})
            except Exception as e:
                q.put({"type": "error", "message": str(e)})

        # Start background thread
        thread = threading.Thread(target=run_pipeline)
        thread.start()

        def event_generator():
            while True:
                try:
                    item = q.get(timeout=30)
                    yield f"data: {json.dumps(item)}\n\n"
                    if item["type"] in ("final", "error"):
                        break
                except queue.Empty:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Request timed out'})}\n\n"
                    break

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    try:
        orchestrator = ConversationOrchestratorService(db)

        from app.monitoring.metrics import metrics_collector

        # Mark active request
        metrics_collector.increment_active()

        try:
            response = orchestrator.chat(
                question=request.question,
                conversation_id=request.conversation_id,
            )
        finally:
            # decrement active regardless of success/failure
            metrics_collector.decrement_active()

        t_before_serial = time.perf_counter()
        _ = response.model_dump()
        t_after_serial = time.perf_counter()

        serialization_time = (t_after_serial - t_before_serial) * 1000.0
        total_time = (t_after_serial - t_start) * 1000.0

        stages = telemetry_data["stages"]
        stage_names = [
            ("Receive request", stages.get("receive_request", 0.0)),
            ("Load conversation", stages.get("load_conversation", 0.0)),
            ("Save user message", stages.get("save_user_message", 0.0)),
            ("Query classification", stages.get("query_classification", 0.0)),
            ("Embedding", stages.get("embedding_generation", 0.0)),
            ("Vector search", stages.get("chroma_retrieval", 0.0)),
            ("Context build", stages.get("context_assembly", 0.0)),
            ("Prompt build", stages.get("prompt_construction", 0.0)),
            ("LLM API", stages.get("llm_api_call", 0.0)),
            ("Parse response", stages.get("response_parsing", 0.0)),
            ("Save assistant message", stages.get("save_assistant_message", 0.0)),
            ("Response serialization", serialization_time),
        ]

        measured_total = sum(duration for name, duration in stage_names)
        actual_total = total_time
        difference = actual_total - measured_total

        # Print detailed timings to console
        for name, duration in stage_names:
            print(f"{name} : {duration:.2f} ms")
        print()
        print(f"Measured Total : {measured_total:.2f} ms")
        print(f"Actual Total : {actual_total:.2f} ms")
        print(f"Difference : {difference:.2f} ms")

        # Persist aggregated metrics (reuse existing telemetry)
        try:
            from app.monitoring.metrics import metrics_collector
            from app.config import chat_telemetry

            telemetry = chat_telemetry.get()
            metrics_collector.record_success_from_telemetry(telemetry, db=db)
        except Exception:
            pass

        return response

    except GeminiException as gemini_exc:
        from fastapi.responses import JSONResponse
        try:
            from app.monitoring.metrics import metrics_collector
            metrics_collector.record_failure(db=db)
        except Exception:
            pass
        error_payload = {
            "status": "error",
            "message": gemini_exc.message,
            "error_code": gemini_exc.error_code,
            "sources": [],
            "retrieved_chunks": 0
        }
        return JSONResponse(
            status_code=gemini_exc.status_code,
            content=error_payload
        )

    except Exception as exc:
        from app.config import logger
        logger.exception("Chat endpoint execution failed")
        try:
            from app.monitoring.metrics import metrics_collector
            metrics_collector.record_failure(db=db)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )