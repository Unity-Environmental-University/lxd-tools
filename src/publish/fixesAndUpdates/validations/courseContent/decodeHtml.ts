export function decodeHtml(html: string) {
    let text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
}

export default decodeHtml;