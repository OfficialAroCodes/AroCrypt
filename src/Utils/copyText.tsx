export default async function CopyText(text: any) {
  try {
    await navigator.clipboard.writeText(text);
    return "success";
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return "error";
  }
}