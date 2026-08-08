import math
import re
from typing import List
from langchain_core.documents import Document

class BM25Retriever:
    """
    Lightweight, self-contained BM25 Keyword Retriever.
    """

    def __init__(self, documents: List[Document], k1: float = 1.5, b: float = 0.75):
        self.documents = documents
        self.k1 = k1
        self.b = b
        self.corpus_size = len(documents)
        
        # Tokenize corpus
        self.tokenized_corpus = [self._tokenize(doc.page_content) for doc in documents]
        self.doc_lengths = [len(doc) for doc in self.tokenized_corpus]
        self.avg_doc_len = sum(self.doc_lengths) / self.corpus_size if self.corpus_size > 0 else 0
        
        # Document frequencies of terms
        self.df = {}
        for doc in self.tokenized_corpus:
            unique_terms = set(doc)
            for term in unique_terms:
                self.df[term] = self.df.get(term, 0) + 1
                
        # Term frequencies in documents
        self.tf = []
        for doc in self.tokenized_corpus:
            frequencies = {}
            for term in doc:
                frequencies[term] = frequencies.get(term, 0) + 1
            self.tf.append(frequencies)

    def _tokenize(self, text: str) -> List[str]:
        # Simple word tokenization (lowercase, alphanumeric words)
        return re.findall(r"\w+", text.lower())

    def _idf(self, term: str) -> float:
        n = self.df.get(term, 0)
        return math.log((self.corpus_size - n + 0.5) / (n + 0.5) + 1.0)

    def search(self, query: str, k: int = 4) -> List[Document]:
        if self.corpus_size == 0:
            return []
            
        query_terms = self._tokenize(query)
        scores = []
        
        for idx in range(self.corpus_size):
            score = 0.0
            doc_len = self.doc_lengths[idx]
            tf_dict = self.tf[idx]
            
            for term in query_terms:
                if term not in tf_dict:
                    continue
                tf_val = tf_dict[term]
                idf_val = self._idf(term)
                
                # Standard BM25 term weight
                numerator = tf_val * (self.k1 + 1.0)
                denominator = tf_val + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                score += idf_val * (numerator / denominator)
                
            scores.append((self.documents[idx], score))
            
        # Sort descending and filter non-zero matches
        scores.sort(key=lambda x: x[1], reverse=True)
        for doc, score in scores:
            doc.metadata["bm25_score"] = float(score)
        return [doc for doc, score in scores[:k] if score > 0]
