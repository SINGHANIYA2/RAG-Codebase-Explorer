from ingest.clone_repo import clone_repo
from ingest.load_files import load_code_files
from ingest.chunk_code import chunk_code_documents
from embeddings.embedder import store_embeddings

from rag.generator import answer_question


def ingest_repo(repo_url):

    print("\nCloning repository...")
    repo_path = clone_repo(repo_url)

    print("\nLoading files...")
    docs = load_code_files(repo_path)

    print("Files loaded:", len(docs))

    print("\nChunking code...")
    chunks = chunk_code_documents(docs)

    print("Total chunks:", len(chunks))

    print("\nCreating embeddings...")
    store_embeddings(chunks)

    print("\nRepository indexed successfully!")


def ask_questions():

    while True:

        question = input("\nAsk about the repository (or 'exit'): ")

        if question.lower() == "exit":
            break

        answer = answer_question(question)

        print("\nAI Answer:\n")
        print(answer)


if __name__ == "__main__":

    repo_url = input("Enter GitHub repo URL: ")

    ingest_repo(repo_url)

    ask_questions()
