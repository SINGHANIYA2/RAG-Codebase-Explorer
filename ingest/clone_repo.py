import os
from git import Repo
from urllib.parse import urlparse


def get_repo_name(repo_url: str) -> str:
    """
    Extract repository name from GitHub URL
    Example:
    https://github.com/user/project.git -> project
    """
    path = urlparse(repo_url).path
    repo_name = os.path.basename(path)

    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]

    return repo_name


def clone_repo(repo_url: str, base_dir: str = "repos") -> str:
    """
    Clone GitHub repo and return local path
    """

    # create repos directory if not exists
    os.makedirs(base_dir, exist_ok=True)

    repo_name = get_repo_name(repo_url)
    repo_path = os.path.join(base_dir, repo_name)

    # skip if already cloned
    if os.path.exists(repo_path):
        print(f"Repository already exists at {repo_path}")
        return repo_path

    print(f"Cloning repository: {repo_url}")
    Repo.clone_from(repo_url, repo_path)

    print(f"Repository cloned to: {repo_path}")

    return repo_path


if __name__ == "__main__":
    repo_url = input("Enter GitHub repo URL: ")
    path = clone_repo(repo_url)
    print("Local repo path:", path)

