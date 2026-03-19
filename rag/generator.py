from dotenv import load_dotenv
import os
load_dotenv()
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

from rag.retriever import search_code


def get_llm():

    api_key = os.getenv("GOOGLE_API_KEY")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.2
    )

    return llm


def build_context(results):

    context = ""

    for r in results:
        context += f"\nFile: {r.metadata['source']}\n"
        context += r.page_content
        context += "\n\n"

    return context


def answer_question(question):

    results = search_code(question)

    context = build_context(results)

    prompt = PromptTemplate.from_template(
        """
        You are a senior software engineer.

        Use the following code context to answer the question.

        Code Context:
        {context}

        Question:
        {question}

        Explain clearly and mention file names.
        """
    )

    llm = get_llm()

    chain = prompt | llm

    response = chain.invoke(
        {
            "context": context,
            "question": question
        }
    )

    return response.content


if __name__ == "__main__":

    question = input("Ask about the repository: ")

    answer = answer_question(question)

    print("\nAI Explanation:\n")
    print(answer)
