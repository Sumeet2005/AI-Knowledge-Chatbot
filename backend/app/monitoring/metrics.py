import threading
from typing import Optional, Deque, Dict, Any
from collections import deque
import time
import platform


def _get_system_resources():
    # Attempt to use psutil for accurate system metrics; fallback to simple estimates
    try:
        import psutil

        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.1)
        return {
            "ram_total": mem.total,
            "ram_used": mem.used,
            "ram_percent": mem.percent,
            "cpu_percent": cpu,
        }
    except Exception:
        # Minimal fallback
        return {
            "ram_total": None,
            "ram_used": None,
            "ram_percent": None,
            "cpu_percent": None,
        }


class MetricsCollector:
    """In-memory metrics aggregator that consumes existing telemetry.

    Tracks success/failure counts, active requests, rolling averages and history
    for charts, and provides lightweight system resource snapshots.
    """

    def __init__(self, history_size: int = 200):
        self._lock = threading.Lock()

        # Counters
        self.success_count = 0
        self.failed_count = 0

        # Aggregated totals
        self.total_response_ms = 0.0
        self.total_retrieval_ms = 0.0
        self.total_llm_ms = 0.0

        # Active concurrent requests
        self.active_requests = 0

        # Keep recent history of telemetry snapshots
        self.history_size = history_size
        self.history: Deque[Dict[str, Any]] = deque(maxlen=history_size)

    def _compute_times_from_telemetry(self, telemetry: Optional[dict]):
        if not telemetry:
            return None

        stages = telemetry.get("stages", {})

        retrieval_time = (
            stages.get("embedding_generation", 0.0)
            + stages.get("chroma_retrieval", 0.0)
            + stages.get("context_assembly", 0.0)
        )

        if "llm_api_call" in stages:
            llm_time = stages.get("llm_api_call", 0.0)
        else:
            llm_time = (
                stages.get("gemini_api_call", 0.0)
                + stages.get("groq_api_call", 0.0)
                + stages.get("ollama_api_call", 0.0)
            )

        start_time = telemetry.get("start_time")
        response_time = 0.0
        if start_time:
            response_time = (time.perf_counter() - start_time) * 1000.0

        return {
            "response_ms": float(response_time),
            "retrieval_ms": float(retrieval_time),
            "llm_ms": float(llm_time),
        }

    def _is_telemetry_enabled(self, db: Optional[Any] = None) -> bool:
        from app.config import get_db_settings
        from app.api.settings import DEFAULTS
        try:
            db_settings = get_db_settings(db)
            tel_settings = db_settings.get("telemetry", {}) if db_settings else DEFAULTS.get("telemetry", {})
            return tel_settings.get("enable_telemetry", True)
        except Exception:
            return True

    def record_success_from_telemetry(self, telemetry: Optional[dict], db: Optional[Any] = None):
        if not self._is_telemetry_enabled(db):
            return
        computed = self._compute_times_from_telemetry(telemetry)
        if not computed:
            return
        with self._lock:
            self.success_count += 1
            self.total_response_ms += computed["response_ms"]
            self.total_retrieval_ms += computed["retrieval_ms"]
            self.total_llm_ms += computed["llm_ms"]
            self.history.append({
                "ts": int(time.time()),
                "response_ms": computed["response_ms"],
                "retrieval_ms": computed["retrieval_ms"],
                "llm_ms": computed["llm_ms"],
            })

    def record_failure(self, db: Optional[Any] = None):
        if not self._is_telemetry_enabled(db):
            return
        with self._lock:
            self.failed_count += 1

    def get_averages(self):
        with self._lock:
            total = self.success_count + self.failed_count
            if total == 0:
                return {
                    "avg_response_ms": 0.0,
                    "avg_retrieval_ms": 0.0,
                    "avg_llm_ms": 0.0,
                    "requests": 0,
                }

            return {
                "avg_response_ms": (self.total_response_ms / total) if total else 0.0,
                "avg_retrieval_ms": (self.total_retrieval_ms / total) if total else 0.0,
                "avg_llm_ms": (self.total_llm_ms / total) if total else 0.0,
                "requests": total,
            }

    def get_history(self):
        with self._lock:
            return list(self.history)

    def get_counts(self):
        with self._lock:
            return {
                "success": self.success_count,
                "failed": self.failed_count,
                "active": self.active_requests,
            }

    def increment_active(self):
        with self._lock:
            self.active_requests += 1

    def decrement_active(self):
        with self._lock:
            if self.active_requests > 0:
                self.active_requests -= 1

    def get_system_resources(self):
        return _get_system_resources()


# Process-global singleton
metrics_collector = MetricsCollector()
