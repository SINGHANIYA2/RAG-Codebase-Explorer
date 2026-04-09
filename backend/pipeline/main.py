from ingest.clone_repo import clone_repo
from ingest.load_files import load_code_files
from ingest.chunk_code import chunk_code_documents
from embeddings.embedder import store_embeddings

from rag.retriever import search_code
from rag.generator import answer_question, debug_code as generator_debug_code

import shutil
import os
import stat
import time



#DELETE HANDLER

def force_delete(func, path, exc_info):
    """
    Handle Windows permission errors while deleting
    """
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception as e:
        print(f" Still failed to delete: {path} | Error: {e}")


#  INGEST PIPELINE

def ingest_repo(repo_url, repo_id):
    print("\n Ingestion started...\n")
    try:
        # CLONE
        print("Cloning repository...")
        result = clone_repo(repo_url)
        repo_path = result["repo_path"]

        # LOAD FILES
   
        print("\nLoading files...")
        docs = load_code_files(repo_path)
        print(f"Files loaded: {len(docs)}")

        if not docs:
            raise Exception("No valid code files found in repo")

        # CHUNK
        print("\nChunking code...")
        chunks = chunk_code_documents(docs, repo_id=repo_id)
        print(f"Total chunks: {len(chunks)}")

        if not chunks:
            raise Exception("Chunking failed — no chunks created")

        print("\nCreating embeddings...")
        store_embeddings(chunks, collection_name=repo_id)

        print("\n Repository indexed successfully!")

        return {"repo_id": repo_id}

    except Exception as e:
        print(" Ingestion failed:", str(e))
        raise e

    finally:

        try:
            if os.path.exists(repo_path):
                time.sleep(1)  # allow file handles to release
                shutil.rmtree(repo_path, onerror=force_delete)
                print(f" Deleted repo folder: {repo_path}")
        except Exception as e:
            print(" Failed to delete repo:", str(e))

def ask_questions(question, repo_id):

    results = search_code(question, repo_id=repo_id)

    answer = answer_question(question, repo_id=repo_id)

    return answer


def debug_code(question, repo_id):
    """Debug pipeline: uses specialized debug prompt with more context."""
    return generator_debug_code(question=question, repo_id=repo_id)

