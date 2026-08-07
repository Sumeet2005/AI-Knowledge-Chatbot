from app.ai.retrieval import RetrieverService

retriever = RetrieverService()

documents = retriever.retrieve(
    "What projects has Sumeet worked on?"
)

print(f"\nRetrieved {len(documents)} documents\n")

context = retriever.build_context(documents)

print(context)