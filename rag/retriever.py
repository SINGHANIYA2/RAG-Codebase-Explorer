from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient


def get_vectorstore():

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    client = QdrantClient(
        host="localhost",
        port=6333
    )

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name="codebase",
        embedding=embeddings,
    )

    return vectorstore


def search_code(query):

    vectorstore = get_vectorstore()

    results = vectorstore.similarity_search(query, k=5)

    return results


if __name__ == "__main__":

    query = input("Ask about the codebase: ")

    results = search_code(query)

    print("\nTop results:\n")

    for r in results:
        print("File:", r.metadata["source"])
        print(r.page_content[:200])
        print("\n---\n")

