"""
Extrae el texto del manual PDF del CFW500 a un archivo JSON (manual_data.json)
que la aplicación carga en producción.

Uso (una sola vez, o cuando cambie el PDF):
    venv/Scripts/python build_manual.py

Requiere: pypdf  (pip install pypdf)  -- solo para extraer, NO para producción.
El JSON generado se sube al repositorio y sobrevive a los redeploys de Render.
"""
import json
import os
import re

from pypdf import PdfReader

PDF_FILE = "WEG-CFW500-manual-de-programacion-10002296096-es.pdf"
OUT_FILE = "manual_data.json"
TITLE = "Manual de Usuario - WEG CFW500"


def limpiar(texto: str) -> str:
    """Normaliza espacios y saltos de línea conservando la estructura."""
    # une líneas partidas y colapsa espacios múltiples
    texto = texto.replace("\r", "\n")
    lineas = [ln.strip() for ln in texto.split("\n")]
    lineas = [ln for ln in lineas if ln]
    texto = "\n".join(lineas)
    texto = re.sub(r"[ \t]{2,}", " ", texto)
    return texto.strip()


def main():
    if not os.path.exists(PDF_FILE):
        raise SystemExit(f"No se encontró el PDF: {PDF_FILE}")

    reader = PdfReader(PDF_FILE)
    paginas = []
    for i, page in enumerate(reader.pages, start=1):
        try:
            texto = limpiar(page.extract_text() or "")
        except Exception as e:
            texto = ""
            print(f"  [aviso] página {i}: error al extraer ({e})")
        if texto:
            paginas.append({"n": i, "text": texto})

    data = {
        "title": TITLE,
        "source": PDF_FILE,
        "total_pages": len(reader.pages),
        "pages": paginas,
    }

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    chars = sum(len(p["text"]) for p in paginas)
    print(f"OK -> {OUT_FILE}")
    print(f"  páginas con texto: {len(paginas)}/{len(reader.pages)}")
    print(f"  caracteres totales: {chars:,}")


if __name__ == "__main__":
    main()
