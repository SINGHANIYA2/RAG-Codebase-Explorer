from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient


def get_embedding_model():
    """
    Load local embedding model
    """

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings


def store_embeddings(chunks, collection_name="codebase"):
    """
    Store code chunks in Qdrant
    """

    embeddings = get_embedding_model()

    # connect to local qdrant
    client = QdrantClient(
        host="localhost",
        port=6333
    )

    vectorstore = QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        url="http://localhost:6333",
        collection_name="codebase",
    )

    return vectorstore


if __name__ == "__main__":

    from ingest.load_files import load_code_files
    from ingest.chunk_code import chunk_code_documents

    repo_path = "repos/sample_repo"

    # load files
    docs = load_code_files(repo_path)

    # chunk code
    chunks = chunk_code_documents(docs)

    print("Total chunks:", len(chunks))

    # store embeddings
    vectorstore = store_embeddings(chunks)

    print("Embeddings stored in Qdrant collection: codebase")
