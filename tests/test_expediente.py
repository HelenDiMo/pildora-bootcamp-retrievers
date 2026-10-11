from sherlock.expediente import cargar_expediente


def test_el_expediente_tiene_los_once_documentos():
    ids = [d["id"] for d in cargar_expediente()]
    assert len(ids) == 11
    assert len(set(ids)) == 11


def test_cada_documento_tiene_los_campos_necesarios():
    for d in cargar_expediente():
        for campo in ("id", "titulo", "tipo", "autor", "fecha", "texto"):
            assert d[campo], f"{d['id']} no tiene {campo}"


def test_el_sabueso_no_aparece_en_ningun_documento():
    # Es la base de la trampa: BM25 no puede encontrarlo, los embeddings sí.
    assert not any("sabueso" in d["texto"].lower() for d in cargar_expediente())
