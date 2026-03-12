import { sanitize } from "dompurify";

export function decodeHtml(html: string) {
  const text = document.createElement("textarea");
  text.innerHTML = sanitize(html);
  return text.value;
}

export default decodeHtml;
