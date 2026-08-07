from app.services.chat import ChatService

service = ChatService()

response = service.chat(
    "What projects has Sumeet worked on?"
)

print("\n")
print("=" * 80)
print("CHAT RESPONSE")
print("=" * 80)

print("\nAnswer\n")
print(response.answer)

print("\nSources\n")

for source in response.sources:
    print(source.model_dump())

print(f"\nRetrieved Chunks: {response.retrieved_chunks}")
print(f"Response Time: {response.response_time_ms} ms")