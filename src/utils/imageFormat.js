function formatarImagem(buffer) {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

module.exports = { formatarImagem };