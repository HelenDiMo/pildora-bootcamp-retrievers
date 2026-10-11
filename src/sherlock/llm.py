"""El detective: el LLM que razona con las pruebas que trae el retriever.

- Si hay ANTHROPIC_API_KEY y está instalado `langchain-anthropic`, usa Claude.
- Si no, usa un "detective simulado" que NO es un LLM: solo enumera las pruebas
  recibidas. Sirve para ver que la cadena funciona sin gastar ni una clave, y
  para recordar que lo importante de esta píldora es qué pruebas le llegan.
"""

from __future__ import annotations

import os

MODELO_ANTHROPIC = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")


def hay_llm_real() -> bool:
    if not os.getenv("ANTHROPIC_API_KEY"):
        return False
    try:
        import langchain_anthropic  # noqa: F401
    except ImportError:
        return False
    return True


def crear_detective_langchain():
    """Devuelve un Runnable de LangChain: entra el prompt, sale un mensaje."""
    if hay_llm_real():
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(model=MODELO_ANTHROPIC, temperature=0)

    from langchain_core.messages import AIMessage
    from langchain_core.runnables import RunnableLambda

    def detective_simulado(valor_prompt) -> AIMessage:
        texto = valor_prompt.to_string()
        pruebas = texto.split("PRUEBAS:", 1)[-1].split("PREGUNTA:", 1)[0].strip()
        lineas = [l for l in pruebas.splitlines() if l.strip()]
        return AIMessage(
            content=(
                "[Detective simulado: no es un LLM, solo muestra lo que recibió]\n"
                f"Me han llegado {len(lineas)} pruebas:\n" + "\n".join(lineas)
            )
        )

    return RunnableLambda(detective_simulado)


def describir_detective() -> str:
    return (
        f"Claude ({MODELO_ANTHROPIC})" if hay_llm_real() else "detective simulado (sin LLM)"
    )
