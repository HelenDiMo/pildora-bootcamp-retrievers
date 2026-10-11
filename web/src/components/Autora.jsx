export const REPO_URL = "https://github.com/HelenDiMo/pildora-bootcamp-retrievers";

/** Firma de la autora: el nombre en texto y el usuario de GitHub como enlace al repo. */
export default function Autora({ className = "" }) {
  return (
    <span className={className}>
      Autora: Elena Díaz - <a href={REPO_URL} target="_blank" rel="noopener noreferrer">@HelenDiMo</a>
    </span>
  );
}
