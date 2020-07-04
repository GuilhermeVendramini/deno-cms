function getTemplate(field, bundle, type, data, picked) {
  let template;
  switch (bundle) {
    case 'taxonomy':
      template = getTaxonomyTemplate(field, data, picked);
      break;
    case 'content':
      template = getContentTemplate(field, data, picked);
      break;
    case 'media':
      template = getMediaTemplate(type, field, data, picked);
      break;
    default:
      template = getDefaultTemplate(field, data, picked);
      break;
  }
  return template;
}

function getMediaTemplate(type, field, data, picked) {
  let template;
  switch (type) {
    case 'image':
      template = getMediaImageTemplate(field, data, picked);
      break;
    default:
      template = getDefaultTemplate(field, data, picked);
      break;
  }
  return template;
}

function getMediaImageTemplate(field, data, picked) {
  let classStatus = picked ? 'btn-secondary' : 'btn-outline-primary';
  let template = `
    <a id="op-${field}-${data._id.$oid}" data-id="${data._id.$oid}" class=" ${data._id.$oid} btn ${classStatus} btn-sm m-2" href="#" role="button">
      <img src="/${data.data.image}" height="50">
      ${data.data.title}
    </a>`;
  return template;
}

function getTaxonomyTemplate(field, data, picked) {
  let classStatus = picked ? 'btn-secondary' : 'btn-outline-primary';
  let template = `
    <a id="op-${field}-${data._id.$oid}" data-id="${data._id.$oid}" class=" ${data._id.$oid} btn ${classStatus} btn-sm m-2" href="#" role="button">
      ${data.data.title}
    </a>`;
  return template;
}

function getContentTemplate(field, data, picked) {
  let classStatus = picked ? 'btn-secondary' : 'btn-outline-primary';
  let template = `
    <a id="op-${field}-${data._id.$oid}" class="${data._id.$oid} btn ${classStatus} btn-sm m-2" href="#" role="button">
      ${data.data.title}
    </a>`;
  return template;
}

function getDefaultTemplate(field, data, picked) {
  let classStatus = picked ? 'btn-secondary' : 'btn-outline-primary';
  let text = data?.data?.title ? data.data.title : data._id.$oid;
  let template = `
    <a id="op-${field}-${data._id.$oid}" class="${data._id.$oid} btn ${classStatus} btn-sm m-2" href="#" role="button">
      ${text}
    </a>`;
  return template;
}