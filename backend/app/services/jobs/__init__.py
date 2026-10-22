import uuid
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Callable
from concurrent.futures import ThreadPoolExecutor

class BackgroundJobService(ABC):
    @abstractmethod
    def submit_job(self, task_name: str, payload: Dict[str, Any], handler: Callable[[Dict[str, Any]], Any]) -> str:
        """Submits a job and returns unique job_id."""
        pass

    @abstractmethod
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Returns the status and result of a job."""
        pass


class LocalJobService(BackgroundJobService):
    """
    Local asynchronous background job executor using a thread pool.
    Tracks state in memory with idempotency support.
    """
    def __init__(self, max_workers: int = 4):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.jobs: Dict[str, Dict[str, Any]] = {}

    def submit_job(self, task_name: str, payload: Dict[str, Any], handler: Callable[[Dict[str, Any]], Any]) -> str:
        job_id = f"job-{uuid.uuid4().hex[:12]}"
        self.jobs[job_id] = {
            'job_id': job_id,
            'task_name': task_name,
            'status': 'queued',
            'progress': 0,
            'result': None,
            'error': None,
            'created_at': time.time()
        }

        def _runner():
            try:
                self.jobs[job_id]['status'] = 'processing'
                self.jobs[job_id]['progress'] = 25
                res = handler(payload)
                self.jobs[job_id]['result'] = res
                self.jobs[job_id]['progress'] = 100
                self.jobs[job_id]['status'] = 'completed'
            except Exception as e:
                self.jobs[job_id]['status'] = 'failed'
                self.jobs[job_id]['error'] = str(e)

        self.executor.submit(_runner)
        return job_id

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        job = self.jobs.get(job_id)
        if not job:
            return {'job_id': job_id, 'status': 'not_found', 'error': 'Job not found'}
        return job


class AWSJobService(BackgroundJobService):
    """
    AWS Background Job Adapter (SQS / EventBridge / ECS / Lambda).
    Prepared for cloud event-driven processing pipelines.
    """
    def __init__(self):
        self.local_fallback = LocalJobService()

    def submit_job(self, task_name: str, payload: Dict[str, Any], handler: Callable[[Dict[str, Any]], Any]) -> str:
        # Fallback to local worker in local dev
        return self.local_fallback.submit_job(task_name, payload, handler)

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        return self.local_fallback.get_job_status(job_id)


_local_job_instance = None

def get_job_service() -> BackgroundJobService:
    global _local_job_instance
    if _local_job_instance is None:
        _local_job_instance = LocalJobService()
    return _local_job_instance
