"""
Knowledge Base Service — RAG retrieval using ChromaDB + sentence-transformers.
Indexes classical I Ching texts for semantic search during AI interpretation.
"""
import os
import logging
from typing import List

from app.data.classical_texts import CLASSICAL_KNOWLEDGE, KnowledgeChunk

try:
    from chromadb import Client, Settings as ChromaSettings
    from chromadb.utils import embedding_functions
    HAS_CHROMADB = True
except ImportError:
    HAS_CHROMADB = False

logger = logging.getLogger(__name__)

COLLECTION_NAME = "liuyao_knowledge"
PERSIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")

# Use a multilingual embedding model that supports Chinese
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


class KnowledgeBase:
    """Manages the vector knowledge base for RAG retrieval."""

    def __init__(self):
        self._client: Client | None = None
        self._collection = None
        self._initialized = False

    def initialize(self):
        """Initialize ChromaDB client and index documents."""
        if self._initialized:
            return

        if not HAS_CHROMADB:
            logger.info("ChromaDB not installed, using keyword fallback search")
            self._initialized = True
            self._collection = None
            return

        try:
            os.makedirs(PERSIST_DIR, exist_ok=True)

            self._client = Client(ChromaSettings(
                persist_directory=PERSIST_DIR,
                anonymized_telemetry=False,
            ))

            embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=EMBEDDING_MODEL,
            )

            # Get or create collection
            try:
                self._collection = self._client.get_collection(
                    name=COLLECTION_NAME,
                    embedding_function=embedding_fn,
                )
                logger.info(f"Loaded existing collection: {self._collection.count()} docs")
            except Exception:
                self._collection = self._client.create_collection(
                    name=COLLECTION_NAME,
                    embedding_function=embedding_fn,
                    metadata={"description": "六爻经典知识库"},
                )
                self._index_documents()
                logger.info(f"Created and indexed collection")

            self._initialized = True

        except Exception as e:
            logger.warning(f"ChromaDB initialization failed, using fallback: {e}")
            self._initialized = True  # Mark as initialized even if failed
            self._collection = None

    def _index_documents(self):
        """Index all classical knowledge chunks into ChromaDB."""
        if not self._collection:
            return

        ids = []
        documents = []
        metadatas = []

        for chunk in CLASSICAL_KNOWLEDGE:
            ids.append(chunk.id)
            documents.append(f"【{chunk.title}】\n{chunk.content}")
            metadatas.append({
                "title": chunk.title,
                "category": chunk.category,
                "source": chunk.source,
                "tags": ",".join(chunk.tags),
            })

        # Batch insert
        batch_size = 10
        for i in range(0, len(ids), batch_size):
            self._collection.add(
                ids=ids[i:i + batch_size],
                documents=documents[i:i + batch_size],
                metadatas=metadatas[i:i + batch_size],
            )

        logger.info(f"Indexed {len(ids)} knowledge chunks")

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        """
        Semantic search for relevant knowledge chunks.
        Falls back to keyword search if ChromaDB is unavailable.
        """
        if self._collection and self._initialized:
            try:
                results = self._collection.query(
                    query_texts=[query],
                    n_results=n_results,
                )
                return [
                    {
                        "id": results["ids"][0][i],
                        "document": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results.get("distances", [[0]])[0][i],
                    }
                    for i in range(len(results["ids"][0]))
                ]
            except Exception as e:
                logger.warning(f"Vector search failed: {e}")

        # Fallback: keyword-based search
        return self._keyword_search(query, n_results)

    def _keyword_search(self, query: str, n_results: int = 5) -> list[dict]:
        """Simple keyword-based fallback search."""
        keywords = set(query)
        scored = []

        for chunk in CLASSICAL_KNOWLEDGE:
            text = chunk.title + chunk.content
            score = sum(1 for c in keywords if c in text)
            # Bonus for tag matches
            score += sum(2 for tag in chunk.tags if tag in query)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "id": chunk.id,
                "document": f"【{chunk.title}】\n{chunk.content}",
                "metadata": {
                    "title": chunk.title,
                    "category": chunk.category,
                    "source": chunk.source,
                    "tags": ",".join(chunk.tags),
                },
                "distance": 0.0,
            }
            for score, chunk in scored[:n_results]
        ]

    def search_by_category(self, category: str, n_results: int = 5) -> list[KnowledgeChunk]:
        """Search chunks by category (theory, rule, case, reference)."""
        results = [c for c in CLASSICAL_KNOWLEDGE if c.category == category]
        return results[:n_results]

    def get_all_titles(self) -> list[dict]:
        """Get all knowledge chunk titles and IDs."""
        return [
            {"id": chunk.id, "title": chunk.title, "category": chunk.category}
            for chunk in CLASSICAL_KNOWLEDGE
        ]


# Singleton
_kb_instance: KnowledgeBase | None = None


def get_knowledge_base() -> KnowledgeBase:
    global _kb_instance
    if _kb_instance is None:
        _kb_instance = KnowledgeBase()
        _kb_instance.initialize()
    return _kb_instance
