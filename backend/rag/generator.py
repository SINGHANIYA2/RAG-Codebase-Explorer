import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from rag.retriever import search_code

from dotenv import load_dotenv
load_dotenv()


# LLM
def get_llm():
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,
        api_key=os.getenv("OPENAI_API_KEY")
    )



# BUILD CONTEXT
def build_context(results):
    context = ""

    for r in results:
        source = r.metadata.get("source", "unknown_file")
        content = r.page_content

        context += f"\nFile: {source}\n"
        context += content
        context += "\n\n"

    return context



def answer_question(question: str, repo_id: str, debug: bool = False):

    results = search_code(question, repo_id=repo_id)

    if debug:
        print("\n🧠 DEBUG MODE")
        print(f"Query: {question}")
        print(f"Repo ID: {repo_id}")
        print(f"Retrieved chunks: {len(results)}\n")

        for i, r in enumerate(results):
            print(f"--- Result {i+1} ---")
            print("File:", r.metadata.get("source"))
            print("Preview:", r.page_content[:200])
            print()

    context = build_context(results)

    prompt = PromptTemplate.from_template(
        """
        You are a highly skilled senior software engineer and codebase analyst.

        Your job is to deeply understand and explain a codebase using the provided context.

        ---------------------
        GUIDELINES:

        1. Always base your answer strictly on the provided code context.
        2. If the context is insufficient, clearly say:
        "I don’t have enough information from the codebase."
        3. Prefer accuracy over guessing.

        ---------------------
        HOW TO ANSWER:

        1.  Summary  
        - Brief answer in 2–4 lines.

        2.  Detailed Explanation  
        - Step-by-step logic  
        - Explain interactions

        3.  File References  
        - Mention file names clearly

        4.  Code Insights  
        - Highlight key functions/classes

        5.  Issues / Bugs  
        - Identify risks, inefficiencies

        6. Debugging  
        - Root cause + fix ,  if user asks for debugging then debug the specified code

        7. Improvements  
        - Suggest optimizations , also suggest what you u can use in place of current implementation

        ---------------------
        CODE CONTEXT:
        {context}

        ---------------------
        QUESTION:
        {question}

        ---------------------
        FINAL ANSWER:
    """
    )

    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke({
        "context": context,
        "question": question
    })

    return getattr(response, "content", str(response))


# ─── DEBUG CODE FUNCTION 
def debug_code(question: str, repo_id: str):
    """
    Specialized debugging function: retrieves more context (k=10),
    uses a debug-focused prompt to find bugs, root causes, and fixes.
    """
    # Retrieve more chunks for thorough debugging
    results = search_code(question, repo_id=repo_id, k=10)
    context = build_context(results)

    # Collect file list for reference
    files_found = list(set(
        r.metadata.get("source", "unknown") for r in results
    ))

    debug_prompt = PromptTemplate.from_template(
        """
        You are an expert debugger and code doctor. The user has asked you to debug their code.

        Your task is to analyze the provided codebase context, find bugs, issues, and problems,
        then provide clear fixes.

        ---------------------
        DEBUGGING INSTRUCTIONS:

        1. 🐛 **Bug Identification**
           - List every bug, error, or issue you find
           - Categorize: syntax error, logic error, runtime error, security issue, performance issue

        2. 🔍 **Root Cause Analysis**
           - For each bug, explain WHY it happens
           - Trace the execution path that leads to the bug

        3. 🔧 **Fix**
           - Provide the EXACT corrected code for each bug
           - Use code blocks with the filename as the language tag
           - Show before (broken) and after (fixed) code

        4. ⚠️ **Warnings & Edge Cases**
           - Identify potential edge cases that could cause future issues
           - Flag deprecated APIs, missing error handling, race conditions

        5. ✅ **Verification Steps**
           - Suggest how to verify each fix works
           - Recommend test cases if applicable

        6. 📊 **Summary**
           - Quick summary: total bugs found, severity level, overall code health

        ---------------------
        FILES ANALYZED: {files}

        CODE CONTEXT:
        {context}

        ---------------------
        USER DEBUG REQUEST:
        {question}

        ---------------------
        DEBUG REPORT:
    """
    )

    llm = get_llm()
    chain = debug_prompt | llm

    response = chain.invoke({
        "context": context,
        "question": question,
        "files": ", ".join(files_found),
    })

    return {
        "answer": getattr(response, "content", str(response)),
        "files_analyzed": files_found,
        "chunks_used": len(results),
    }
