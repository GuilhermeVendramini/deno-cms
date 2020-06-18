$(document).ready(function () {
  let entityReference = $('.entity-reference-entities');

  if (entityReference && entityReference.length > 0) {
    entityReference.each(function (index) {
      let dataEntities = $(this).data('entities');
      let entityContainer = $(this);

      $.each(dataEntities, function (entity, types) {
        entityContainer.append(
          `<div class="bg-light p-2 mb-3 entity ${entity}">
            <a class="collapsed" href="#${entity}${index}" role="button" aria-controls="${entity}${index}" data-toggle="collapse" aria-expanded="false">
              <h5 class="border-bottom border-white pb-2 text-center text-capitalize font-weight-bold">
                ${entity.replace('_', ' ')}
              </h5>
            </a>
            <div id="${entity}${index}" class="items collapse"></div>
          </div>`
        );

        let entityItems = entityContainer.find('.entity.' + entity + ' > .items').first();

        $.each(types, async function (_, type) {
          entityItems.append(
            `<div class="border-bottom mb-2 mt-2 p-2 type ${type}">
              <div class="entity-header d-flex justify-content-between">
                <h6 class="text-capitalize font-weight-bold text-secondary">
                  ${type.replace('_', ' ')}
                </h6>
                <div class="actions">
                  <span class="add-new">
                    <a target="_blank" class="btn btn-outline-secondary btn-sm" href="/admin/${entity.replace('_', '-')}/${type.replace('_', '-')}/add">+</a>
                  </span>
                  <span class="refresh">
                    <a data-entity="${entity}" data-type="${type}" class="btn btn-outline-secondary btn-sm" href="#">↻</a>
                  </span>
                </div>
              </div>
              <div class="items clearfix"></div>
            </div>`
          );

          let entities = await getEntities(entity, type);

          if (entities && entities.data) {
            let typeItems = entityContainer.find('.type.' + type + ' > .items').first();
            $.each(entities.data, function (_, data) {
              typeItems.append(
                getTemplate(entity, data)
              );
            });
          }
        });
      });
    });
  }

  $('.refresh > a').click(async function (e) {
    e.preventDefault();
    let entity = $(this).data('entity');
    let type = $(this).data('type');
    let entities = await getEntities(entity, type);

    if (entities && entities.data) {
      let itemsList = $('.entity.' + entity + ' .type.' + type + ' > .items');
      itemsList.html('');
      $.each(entities.data, function (_, data) {
        itemsList.append(
          getTemplate(entity, data)
        );
      });
    }
  });

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
      <div class="font-weight-light float-left text-center m-2 badge badge-primary p-2">
        ${data.data.title}
      </div>`;
    return template;
  }

  function getContentTemplate(data) {
    let template = `
      <div class="font-weight-light float-left text-center m-2 badge badge-info p-2">
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