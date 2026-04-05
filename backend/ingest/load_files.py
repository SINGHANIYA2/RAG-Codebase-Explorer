import os
from langchain_core.documents import Document

# allowed file extensions
CODE_EXTENSIONS = [
    ".py", ".js", ".ts", ".java", ".cpp", ".c",
    ".html", ".css", ".json", ".md",".jsx",".tsx"
]

IGNORE_DIRS = [
    "__pycache__", ".git", "node_modules", "venv", ".venv"
]


def load_code_files(repo_path: str):
    """
    Scan repository and return LangChain Documents
    """

    documents = []

    for root, dirs, files in os.walk(repo_path):

        # remove ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:

            ext = os.path.splitext(file)[1]

            if ext not in CODE_EXTENSIONS:
                continue

            file_path = os.path.join(root, file)

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                doc = Document(
                    page_content=content,
                    metadata={
                        "source": file_path,
                        "file_name": file,
                        "extension": ext,
                    }
                )

                documents.append(doc)

            except Exception:
                continue

    return documents


if __name__ == "__main__":

    repo_path = "repos/sample_repo"

    docs = load_code_files(repo_path)

    print("Loaded documents:", len(docs))
    print("\nExample metadata:")
    print(docs[0].metadata)








# import os
# from langchain_core.documents import Document

# # folders we should ignore
# IGNORE_DIRS = {
#     ".git",
#     "node_modules",
#     "__pycache__",
#     "build",
#     "dist",
#     ".next",
#     "venv",
#     ".idea",
# }

# # code file extensions to index
# CODE_EXTENSIONS = {
#     ".py",
#     ".js",
#     ".ts",
#     ".jsx",
#     ".tsx",
#     ".java",
#     ".cpp",
#     ".c",
#     ".go",
#     ".rs",
#     ".cs",
#     ".php",
#     ".html",
#     ".css",
# }


# def load_code_files(repo_path: str):
#     """
#     Scan repository and return LangChain Documents
#     """

#     documents = []

#     for root, dirs, files in os.walk(repo_path):

#         # remove ignored directories
#         dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

#         for file in files:

#             ext = os.path.splitext(file)[1]

#             if ext not in CODE_EXTENSIONS:
#                 continue

#             file_path = os.path.join(root, file)

#             try:
#                 with open(file_path, "r", encoding="utf-8") as f:
#                     content = f.read()

#                 doc = Document(
#                     page_content=content,
#                     metadata={
#                         "source": file_path,
#                         "file_name": file,
#                         "extension": ext,
#                     },
#                 )

#                 documents.append(doc)

#             except Exception:
#                 # skip files that cannot be read
#                 continue

#     return documents


# if __name__ == "__main__":
#     repo_path = "repos/sample_repo"

#     docs = load_code_files(repo_path)

#     print("Loaded documents:", len(docs))

#     print("\nExample document metadata:")
#     print(docs[0].metadata)
