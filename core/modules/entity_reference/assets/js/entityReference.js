$(document).ready(function () {
  var pickedEntities = [];
  var loadEntities = [];

  buildReference();
  refreshEntities();
  getCurrentEntities();
  submitForm();

  function buildReference() {
    let entityReference = $('.entity-reference-entities');
    if (entityReference && entityReference.length > 0) {
      entityReference.each(function (index) {
        let dataEntities = $(this).data('entities');
        let field = $(this).data('field');
        let entityContainer = $(this);

        setSortable(field);

        $.each(dataEntities, function (bundle, types) {
          entityContainer.append(
            `<div class="bg-light p-2 mb-3 field-${field} entity ${bundle}">
              <a class="collapsed" href="#${bundle}${index}" role="button" aria-controls="${bundle}${index}" data-toggle="collapse" aria-expanded="false">
                <h5 class="border-bottom border-white pb-2 text-center text-capitalize font-weight-bold">
                  ${bundle}
                </h5>
              </a>
              <div id="${bundle}${index}" class="items collapse"></div>
            </div>`
          );

          let entityItems = entityContainer.find('.entity.' + bundle + ' > .items').first();

          $.each(types, async function (_, type) {
            entityItems.append(
              `<div class="border-bottom mb-2 mt-2 p-2 type ${type}">
                <div class="entity-header d-flex justify-content-between">
                  <h6 class="text-capitalize font-weight-bold text-secondary">
                    ${type}
                  </h6>
                  <div class="actions">
                    <span class="add-new">
                      <a target="_blank" class="btn btn-outline-secondary btn-sm" href="/admin/${bundle}/${type}/add">+</a>
                    </span>
                    <span class="refresh">
                      <a data-field="${field}" data-entity="${bundle}" data-type="${type}" class="btn btn-outline-secondary btn-sm" href="#">↻</a>
                    </span>
                  </div>
                </div>
                <div class="items clearfix"></div>
              </div>`
            );

            let entities = await getEntities(bundle, type);
            loadEntities.push(entities);

            if (entities && entities.data) {
              let typeItems = entityContainer.find('.type.' + type + ' > .items').first();
              $.each(entities.data, function (_, data) {
                let picked = getPickedItem(field, data._id.$oid) ? true : false;
                typeItems.append(
                  getTemplate(field, bundle, type, data, picked)
                );
                clickAction(field, data);
              });
            }
          });
        });
      });
    }
  }

  async function getEntities(bundle, type) {
    let result = null;
    await $.ajax({
      url: '/entity-reference/' + bundle + '/' + type,
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

  function getPickedItem(field, id) {
    let found;
    if (found = pickedEntities.find(e => e.field == field && e.entity?._id?.$oid == id)) return found;

    return false;
  }

  function refreshEntities() {
    $('.refresh > a').click(async function (e) {
      e.preventDefault();
      let entity = $(this).data('entity');
      let field = $(this).data('field');
      let type = $(this).data('type');
      let entities = await getEntities(entity, type);

      if (entities && entities.data) {
        let itemsList = $('.field-' + field + '.entity.' + entity + ' .type.' + type + ' > .items');
        itemsList.html('');
        $.each(entities.data, function (_, data) {
          let picked = getPickedItem(field, data._id.$oid) ? true : false;
          itemsList.append(
            getTemplate(field, entity, type, data, picked)
          );
          clickAction(field, data);
        });
      }
    });
  }

  function clickAction(field, data) {
    let id = data._id.$oid;
    $(`#op-${field}-${id}`).click(function (e) {
      e.preventDefault();
      let pickedItem = getPickedItem(field, id);

      if (pickedItem) {
        $(`#${field}-${id}`).remove();
        $(this).addClass('btn-outline-primary');
        $(this).removeClass('btn-secondary');
        pickedEntities.splice(pickedEntities.indexOf(pickedItem), 1);
      } else {
        $(`.${field}-container #sortable-${field}`).append(
          `<li class="list-group-item" id="${field}-${id}">${data.title}</li>`
        );
        $(this).addClass('btn-secondary');
        $(this).removeClass('btn-outline-primary');
        pickedEntities.push({ field: field, entity: data });
      }
    });
  }

  function setSortable(field) {
    $('#sortable-' + field + '').sortable();
    $('#sortable-' + field + '').disableSelection();
  }

  function getCurrentEntities() {
    let fields = $('.entity-reference');
    $.each(fields, function () {
      let value = $(this).val();

      if (value) {
        value = JSON.parse(value);
        value = value.sort(function (a, b) { return a.weight - b.weight });

        $.each(value, function (_, item) {
          let option = $(`#op-${item.field}-${item.entity._id.$oid}`);
          $(`.${item.field}-container #sortable-${item.field}`).append(
            `<li class="list-group-item" id="${item.field}-${item.entity._id.$oid}">${item.entity.title}</li>`
          );

          option.addClass('btn-secondary');
          option.removeClass('btn-outline-primary');
          pickedEntities.push({ field: item.field, entity: item.entity });
        });
      }
    });
  }

  function submitForm() {
    $('#entity-form').submit(function (e) {
      e.preventDefault();
      let entityFields = $('input.entity-reference');

      $.each(entityFields, function () {
        let field = $(this).attr("name");
        let data = pickedEntities.filter(e => e.field == field);
        let sortbleField = $('#sortable-' + field + '');

        $.each(data, function (index, item) {
          let weight = sortbleField.find(`#${field}-${item.entity._id.$oid}`).first().index();
          data[index]['weight'] = weight;
        });
        $(this).val(JSON.stringify(data));
      });

      $(this).unbind('submit').submit();
    });
  }
});