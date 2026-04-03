from ingest.clone_repo import clone_repo
from ingest.load_files import load_code_files
from ingest.chunk_code import chunk_code_documents
from embeddings.embedder import store_embeddings

from rag.retriever import search_code
from rag.generator import answer_question

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
        print(f"⚠️ Still failed to delete: {path} | Error: {e}")


#  INGEST PIPELINE

def ingest_repo(repo_url, repo_id):
    print("\n🚀 Ingestion started...\n")
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
