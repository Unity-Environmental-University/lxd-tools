import DOMPurify from "dompurify";

export function decodeHtml(html: string) {
  const text = document.createElement("textarea");
  text.innerHTML = DOMPurify.sanitize(html);
  return text.value;
}

export default decodeHtml;
