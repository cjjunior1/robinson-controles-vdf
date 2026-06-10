"""
Renderiza cada página del manual PDF del CFW500 como imagen PNG, para mostrarlas
en la página "Manual de Usuario" (tablas y diagramas tal cual el original).

Uso (una sola vez, o cuando cambie el PDF):
    venv/Scripts/python build_manual_images.py

Requiere: pymupdf  (pip install pymupdf)  -- solo para generar, NO para producción.
Las imágenes se guardan en static/manual_img/ y se suben al repositorio.
"""
import os

import fitz  # PyMuPDF

PDF_FILE = "WEG-CFW500-manual-de-programacion-10002296096-es.pdf"
OUT_DIR = os.path.join("static", "manual_img")
DPI = 130


def main():
    if not os.path.exists(PDF_FILE):
        raise SystemExit(f"No se encontró el PDF: {PDF_FILE}")

    os.makedirs(OUT_DIR, exist_ok=True)
    doc = fitz.open(PDF_FILE)
    total = doc.page_count
    bytes_tot = 0

    for i in range(total):
        n = i + 1
        pix = doc[i].get_pixmap(dpi=DPI)
        ruta = os.path.join(OUT_DIR, f"page_{n:03d}.png")
        pix.save(ruta)
        bytes_tot += os.path.getsize(ruta)
        if n % 25 == 0 or n == total:
            print(f"  {n}/{total} páginas...")

    print(f"OK -> {OUT_DIR}  ({total} imágenes, ~{bytes_tot/1024/1024:.1f} MB)")


if __name__ == "__main__":
    main()
