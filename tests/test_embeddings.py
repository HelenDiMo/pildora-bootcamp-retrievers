import numpy as np
import pytest

from sherlock.embeddings import embeber_textos, palabras_desconocidas


def test_el_backend_falso_es_determinista_y_normalizado():
    a = embeber_textos(["hola"], backend="fake")
    b = embeber_textos(["hola"], backend="fake")
    assert np.allclose(a, b)
    assert np.isclose(np.linalg.norm(a[0]), 1.0, atol=1e-5)


def test_backend_desconocido_da_un_error_claro():
    with pytest.raises(ValueError):
        embeber_textos(["hola"], backend="inventado")


def test_palabra_desconocida_no_produce_nan(monkeypatch):
    """«Whitcombe» no está en el vocabulario de spaCy: antes daba similitudes NaN."""
    pytest.importorskip("spacy")
    monkeypatch.setenv("EMBEDDINGS_BACKEND", "spacy")
    try:
        vector = embeber_textos(["Whitcombe"], backend="spacy")[0]
    except RuntimeError:
        pytest.skip("Falta el modelo es_core_news_md de spaCy")
    assert np.isfinite(vector).all()
    assert np.isclose(np.linalg.norm(vector), 1.0, atol=1e-4)
    assert "Whitcombe" in palabras_desconocidas("Whitcombe y el sabueso")
