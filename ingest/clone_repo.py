import os
import uuid
from git import Repo
from urllib.parse import urlparse



# Extract repo name

def get_repo_name(repo_url: str) -> str:
    path = urlparse(repo_url).path
    repo_name = os.path.basename(path)

    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]

    return repo_name


def clone_repo(repo_url: str, base_dir: str = "repos") -> dict:
    """
    Clone GitHub repo and return:
    - repo_id
    - repo_name
    - repo_path
    """

    os.makedirs(base_dir, exist_ok=True)

    # unique repo_id
    repo_id = str(uuid.uuid4())

    repo_name = get_repo_name(repo_url)

    # unique path (VERY IMPORTANT)
    repo_path = os.path.join(base_dir, f"{repo_id}_{repo_name}")

    try:
        print(f"Cloning repository: {repo_url}")
        Repo.clone_from(repo_url, repo_path)

        print(f"Repository cloned to: {repo_path}")

        return {
            "repo_id": repo_id,
            "repo_name": repo_name,
            "repo_path": repo_path
        }

    except Exception as e:
        print("Clone failed:", str(e))
        raise e


if __name__ == "__main__":
    repo_url = input("Enter GitHub repo URL: ")

    result = clone_repo(repo_url)

    print("\n RESULT:")
    print("Repo ID:", result["repo_id"])
    print("Repo Name:", result["repo_name"])
    print("Repo Path:", result["repo_path"])










# import os
# from git import Repo
# from urllib.parse import urlparse


# def get_repo_name(repo_url: str) -> str:
#     """
#     Extract repository name from GitHub URL
#     Example:
#     https://github.com/user/project.git -> project
#     """
#     path = urlparse(repo_url).path
#     repo_name = os.path.basename(path)

#     if repo_name.endswith(".git"):
#         repo_name = repo_name[:-4]

#     return repo_name


# def clone_repo(repo_url: str, base_dir: str = "repos") -> str:
#     """
#     Clone GitHub repo and return local path
#     """

#     # create repos directory if not exists
#     os.makedirs(base_dir, exist_ok=True)

#     repo_name = get_repo_name(repo_url)
#     repo_path = os.path.join(base_dir, repo_name)

#     # skip if already cloned
#     if os.path.exists(repo_path):
#         print(f"Repository already exists at {repo_path}")
#         return repo_path

#     print(f"Cloning repository: {repo_url}")
#     Repo.clone_from(repo_url, repo_path)

#     print(f"Repository cloned to: {repo_path}")

#     return repo_path


# if __name__ == "__main__":
#     repo_url = input("Enter GitHub repo URL: ")
#     path = clone_repo(repo_url)
#     print("Local repo path:", path)

