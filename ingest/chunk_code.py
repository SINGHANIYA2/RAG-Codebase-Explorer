from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def chunk_code_documents(documents):
    """
    Split code documents into smaller chunks for embedding
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=[
            "\nclass ",
            "\ndef ",
            "\nfunction ",
            "\n\n",
            "\n",
            " ",
            ""
        ]
    )

    chunks = splitter.split_documents(documents)

    return chunks


if __name__ == "__main__":
    from load_files import load_code_files

    repo_path = "repos/sample_repo"

    docs = load_code_files(repo_path)

    chunks = chunk_code_documents(docs)

    print("Total files:", len(docs))
    print("Total chunks:", len(chunks))

    print("\nExample chunk metadata:")
    print(chunks[0].metadata)

    print("\nExample chunk content:")
    print(chunks[0].page_content[:300])
