from sherlock.texto import quitar_tildes, tokenizar


def test_quita_tildes_pero_conserva_la_enie():
    assert quitar_tildes("Señor tóxica") == "Señor toxica"


def test_tokenizar_descarta_palabras_vacias_y_signos():
    assert tokenizar("¿Quién vio la luz en la biblioteca?") == ["vio", "luz", "biblioteca"]


def test_tokenizar_es_estable_con_nombres_raros():
    assert tokenizar("Whitcombe") == ["whitcombe"]
