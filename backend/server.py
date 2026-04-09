from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import uuid
from threading import Thread

# pipeline
from pipeline.main import ingest_repo , ask_questions, debug_code

app = FastAPI(title="RAG Codebase Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


repo_status = {}


# schema
class IngestRequest(BaseModel):
    repo_url: str


class QueryRequest(BaseModel):
    question: str
    repo_id: str


class DebugRequest(BaseModel):
    question: str
    repo_id: str


@app.get("/")
def home():
    return {"message": "RAG Codebase Explorer Backend Running"}


@app.post("/ingest")
def ingest(request: IngestRequest):
    try:
        repo_id = str(uuid.uuid4())

        # mark as processing
        repo_status[repo_id] = "processing"

        def background_task():
            try:
                # run ingestion pipeline
                ingest_repo(request.repo_url,repo_id=repo_id)

                # status change kr do to ready for any query
                repo_status[repo_id] = "ready"

            except Exception as e:
                print("Ingestion failed:", str(e))
                repo_status[repo_id] = "failed"

        # run in background
        Thread(target=background_task).start()

        return {
            "status": "processing",
            "repo_id": repo_id,
            "message": "Repository ingestion started"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/status/{repo_id}")
def check_status(repo_id: str):
    status = repo_status.get(repo_id)

    if not status:
        raise HTTPException(status_code=404, detail="Repo not found")

    return {
        "repo_id": repo_id,
        "status": status
    }

# query starts here
@app.post("/query")
def query(request: QueryRequest):
    try:
        status = repo_status.get(request.repo_id)

        if status is None:
            raise HTTPException(status_code=404, detail="Invalid repo_id")

        if status != "ready":
            raise HTTPException(
                status_code=400,
                detail=f"Repo not ready. Current status: {status}"
            )

      
        answer = ask_questions(
            question=request.question,
            repo_id=request.repo_id
        )

        return {
            "status": "success",
            "answer": answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# DEBUG ENDPOINT 
DEBUG_KEYWORDS = [
    "debug", "bug", "fix", "error", "issue", "broken", "crash",
    "failing", "exception", "traceback", "not working", "wrong output",
    "unexpected", "fault", "defect", "troubleshoot",
]

def is_debug_intent(question: str) -> bool:
    """Auto-detect if the user's question is a debug request."""
    q = question.lower()
    return any(kw in q for kw in DEBUG_KEYWORDS)

@app.post("/debug")
def debug_endpoint(request: DebugRequest):
    try:
        status = repo_status.get(request.repo_id)

        if status is None:
            raise HTTPException(status_code=404, detail="Invalid repo_id")

        if status != "ready":
            raise HTTPException(
                status_code=400,
                detail=f"Repo not ready. Current status: {status}"
            )

        result = debug_code(
            question=request.question,
            repo_id=request.repo_id
        )

        return {
            "status": "success",
            "answer": result["answer"],
            "debug_meta": {
                "files_analyzed": result["files_analyzed"],
                "chunks_used": result["chunks_used"],
                "mode": "debug"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  SMART QUERY
@app.post("/smart-query")
def smart_query(request: QueryRequest):
    """Auto-routes to debug or normal query based on intent detection."""
    try:
        status = repo_status.get(request.repo_id)

        if status is None:
            raise HTTPException(status_code=404, detail="Invalid repo_id")
        if status != "ready":
            raise HTTPException(
                status_code=400,
                detail=f"Repo not ready. Current status: {status}"
            )

        if is_debug_intent(request.question):
            result = debug_code(
                question=request.question,
                repo_id=request.repo_id
            )
            return {
                "status": "success",
                "answer": result["answer"],
                "mode": "debug",
                "debug_meta": {
                    "files_analyzed": result["files_analyzed"],
                    "chunks_used": result["chunks_used"],
                }
            }
        else:
            answer = ask_questions(
                question=request.question,
                repo_id=request.repo_id
            )
            return {
                "status": "success",
                "answer": answer,
                "mode": "normal",
                "debug_meta": None
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)












# from ingest.clone_repo import clone_repo
# from ingest.load_files import load_code_files
# from ingest.chunk_code import chunk_code_documents
# from embeddings.embedder import store_embeddings


# from rag.generator import answer_question


# def ingest_repo(repo_url):

#     print("\nCloning repository...")
#     repo_path = clone_repo(repo_url)

#     print("\nLoading files...")
#     docs = load_code_files(repo_path)

#     print("Files loaded:", len(docs))

#     print("\nChunking code...")
#     chunks = chunk_code_documents(docs)

#     print("Total chunks:", len(chunks))

#     print("\nCreating embeddings...")
#     store_embeddings(chunks)

#     print("\nRepository indexed successfully!")


# def ask_questions():

#     while True:

#         question = input("\nAsk about the repository (or 'exit'): ")

#         if question.lower() == "exit":
#             break

#         answer = answer_question(question)

#         print("\nAI Answer:\n")
#         print(answer)


# if __name__ == "__main__":

#     repo_url = input("Enter GitHub repo URL: ")

#     ingest_repo(repo_url)

#     ask_questions()
