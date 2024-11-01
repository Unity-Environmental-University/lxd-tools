export function decodeHtml(html: string) {
    const text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
}

export default decodeHtml;