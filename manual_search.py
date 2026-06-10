"""
Búsqueda en el Manual de Usuario del CFW500.

Carga manual_data.json (generado por build_manual.py) y permite recuperar
las páginas más relevantes a una pregunta. Pensado para alimentar al chatbot:
en cada pregunta se buscan los fragmentos del manual y se le pasan al modelo.

Sin dependencias externas ni costo adicional: búsqueda léxica con prioridad
a los códigos de parámetro/falla (P0202, F0072, A0046...), que son las señales
más precisas en este manual.
"""
import json
import os
import re
import unicodedata

_DATA = None

# Códigos del manual: parámetros Pxxxx, fallas Fxxxx, alarmas Axxxx
_CODE_RE = re.compile(r"\b([PFA]\d{3,4})\b", re.IGNORECASE)

# Referencia de página impresa del manual, ej: "CFW500 | 8-1" o "8-1 | CFW500"
_LABEL_RE = re.compile(r"(?:CFW500\s*\|\s*(\d{1,2}-\d{1,3})|(\d{1,2}-\d{1,3})\s*\|\s*CFW500)")

# Marcadores de que una página *define* un parámetro (no solo lo menciona)
_DEF_MARKERS = ("rango de valores", "rango de", "ajuste de fabrica", "propiedades")

# Palabras vacías (no aportan a la búsqueda)
_STOP = set(
    "de la el los las un una y o a e u en con por para que del al es son como "
    "su sus se lo le mas más cual cuál cuales qué cómo cuando dónde donde sobre "
    "the of to and".split()
)


def _norm(s: str) -> str:
    """Minúsculas y sin acentos, para comparar de forma robusta."""
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    return s.lower()


def _tokens(s: str):
    return [t for t in re.findall(r"[a-z0-9]+", _norm(s)) if len(t) > 2 and t not in _STOP]


def cargar_manual(path: str = "manual_data.json"):
    """Carga el manual en memoria una sola vez."""
    global _DATA
    if _DATA is not None:
        return _DATA

    if not os.path.exists(path):
        _DATA = {"title": "Manual de Usuario", "pages": [], "total_pages": 0}
        return _DATA

    with open(path, encoding="utf-8") as f:
        raw = json.load(f)

    pages = raw.get("pages", [])
    for p in pages:
        p["_norm"] = _norm(p["text"])  # versión normalizada para buscar
        m = _LABEL_RE.search(p["text"])  # referencia de página impresa (ej. 8-1)
        p["label"] = (m.group(1) or m.group(2)) if m else ""

    _DATA = {
        "title": raw.get("title", "Manual de Usuario"),
        "pages": pages,
        "total_pages": raw.get("total_pages", len(pages)),
    }
    return _DATA


def buscar(query: str, k: int = 5):
    """Devuelve las k páginas más relevantes: [{page, text, score}, ...]."""
    data = cargar_manual()
    pages = data["pages"]
    if not pages or not query.strip():
        return []

    q_tokens = set(_tokens(query))
    q_codes = [c.lower() for c in _CODE_RE.findall(query)]
    if not q_tokens and not q_codes:
        return []

    scored = []
    for p in pages:
        texto = p["_norm"]
        score = 0
        cubiertos = 0
        for t in q_tokens:
            c = texto.count(t)
            if c:
                cubiertos += 1
                score += min(c, 5)  # se limita para que un término no domine
        score += cubiertos * 2  # bonus por cubrir más términos de la pregunta
        for code in q_codes:  # los códigos exactos pesan mucho
            if code in texto:
                score += 60
                # si además la página DEFINE el parámetro, súbela aún más
                if any(mk in texto for mk in _DEF_MARKERS):
                    score += 40
        if score > 0:
            scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"page": p["n"], "label": p.get("label", ""), "text": p["text"], "score": s}
        for s, p in scored[:k]
    ]


def contexto_para_prompt(query: str, k: int = 6, max_chars: int = 9000) -> str:
    """Arma el bloque de texto del manual que se inyecta al modelo."""
    fragmentos = buscar(query, k=k)
    bloques = []
    total = 0
    for f in fragmentos:
        ref = f"Página {f['page']} del visor"
        if f.get("label"):
            ref += f" (ref. manual {f['label']})"
        bloque = f"[{ref}]\n{f['text']}"
        if total + len(bloque) > max_chars:
            bloque = bloque[: max(0, max_chars - total)]
        bloques.append(bloque)
        total += len(bloque)
        if total >= max_chars:
            break
    return "\n\n".join(bloques)
