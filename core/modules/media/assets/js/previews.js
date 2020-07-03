function getMediaPreview(type, mediaName, mediaVal) {
  let preview = '';
  switch (type) {
    case 'image':
      preview = `
        <img src="/${mediaVal}" height="100">
        <a href="/${mediaVal}" target="_blank">${mediaName}</a>
      `;
      break;
    case 'video':
      preview = `
        <video height="100" controls>
          <source src="/${mediaVal}">
        </video>
        <a href="/${mediaVal}" target="_blank">${mediaName}</a>
      `;
      break;
    default:
      preview = `
        <a href="/${mediaVal}" target="_blank">${mediaName}</a>
      `;
  }

  return preview;
}