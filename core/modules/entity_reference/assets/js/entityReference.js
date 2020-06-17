$(document).ready(function () {
  let entityReference = $('.entity-reference-entities');

  if (entityReference && entityReference.length > 0) {
    entityReference.each(function () {
      let dataEntities = $(this).data('entities');
      let entityContainer = $(this);

      $.each(dataEntities, function (entity, types) {
        entityContainer.append(
          `<div class="mb-3 entity ${entity}">
            <h4 class="text-capitalize">${entity.replace('_',' ')}</h4>
          </div>`
        );

        $.each(types, async function (_, type) {
          entityContainer.find('.entity.' + entity + '').first().append(
            `<div class="mb-3 type ${type}">
              <h5 class="text-capitalize">${type.replace('_',' ')}</h5>
              <div class="items clearfix"></div>
            </div>`
          );
          let entities = await getEntities(entity, type);

          if (entities && entities.data) {
            $.each(entities.data, function (_, data) {
              entityContainer.find('.type.' + type + ' > .items').first().append(
                getTemplate(entity, data)
              );
            });
          }
        });
      });
    });
  }

  function getTemplate(entity, data) {
    let template;
    switch (entity) {
      case 'taxonomy':
        template = getTaxonomyTemplate(data);
        break;
      case 'content':
        template = getContentTemplate(data);
        break;
      default:
        template = getDefaultTemplate(data);
        break;
    }
    return template;
  }

  function getTaxonomyTemplate(data) {
    let template = `
      <div class="float-left text-center m-2 badge badge-primary p-2">
        ${data.data.title}
      </div>`;
    return template;
  }

  function getContentTemplate(data) {
    let template = `
      <div class="float-left text-center m-2 badge badge-info p-2">
        ${data.data.title}
      </div>`;
    return template;
  }

  function getDefaultTemplate(data) {
    let template = `
      <div class="float-left text-center m-2 badge badge-dark p-2">
        ${data._id.$oid}
      </div>`;
    return template;
  }

  async function getEntities(entity, type) {
    let result = null;
    await $.ajax({
      url: '/entity-reference/' + entity + '/' + type,
      type: 'get',
      dataType: 'json',
      async: true,
      timeout: (2 * 1000),
      success: function (data) {
        result = data;
      }
    });
    return result;
  }
});