$(document).ready(function () {
  let entityReference = $('.form-view-entity-reference');

  if (entityReference && entityReference.length > 0) {
    entityReference.each(function () {
      let dataEntities = $(this).data('entities');
      let entityContainer = $(this);

      $.each(dataEntities, function (entity, types) {
        $.each(types, async function (_, type) {
          let entities = await getEntities(entity, type);

          if (entities && entities.data) {
            $.each(entities.data, function (_, data) {
              console.log(data);
              entityContainer.append(data.data.title);
            });
          }
        });
      });

    });
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