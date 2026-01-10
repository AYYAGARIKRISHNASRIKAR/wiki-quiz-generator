export function truncateText(text, max = 50) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
}
