$(document).ready(function () {
  var pickedEntities = [];
  var loadEntities = [];

  buildReference();
  refreshEntities();
  getCurrentEntities();
  search();
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
                  <div class="actions row">
                    <span class="find pr-1">
                      <input data-field="${field}" data-bundle="${bundle}" data-type="${type}" class="search-entity form-control form-control-sm" name="title" value="" type="text" placeholder="Title">
                    </span>
                    <span class="add-new pr-1">
                      <a target="_blank" class="btn btn-outline-secondary btn-sm" href="/admin/${bundle}/${type}/add">+</a>
                    </span>
                    <span class="refresh pr-1">
                      <a data-field="${field}" data-bundle="${bundle}" data-type="${type}" class="btn btn-outline-secondary btn-sm" href="#">↻</a>
                    </span>
                  </div>
                </div>
                <div class="items clearfix"></div>
                <div class="paginator"></div>
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

              if (entities.data.length >= 2) {
                let paginator = entityContainer.find('.type.' + type + ' > .paginator').first();
                buildPaginator(paginator, field, bundle, type, 0, 0, 1);
              }
            }
          });
        });
      });
    }
  }

  function buildPaginator(paginator, field, bundle, type, current, previous, next) {
    let previousItem = current > 0 ? `<li class="page-item previous">
      <a data-field="${field}" data-bundle="${bundle}" data-type="${type}" class="page-link" href="#" aria-label="Previous">&laquo;</a>
    </li>` : '';

    let nextItem = current != next ? `<li class="page-item next">
      <a data-field="${field}" data-bundle="${bundle}" data-type="${type}" class="page-link" href="#" aria-label="Next">&raquo;</a>
    </li>` : '';

    let html = `
    <nav aria-label="page navigation">
      <ul data-page-current="${current}" data-page-previous="${previous}" data-page-next="${next}" class="mt-3 pagination justify-content-center">
          ${previousItem}
          <li class="page-item"><span class="page-link">${current + 1}</span></li>
          ${nextItem}
      </ul>
    </nav>`;
    paginator.html('');
    paginator.append(html);
    actionPaginator(paginator);
  }


  function actionPaginator(paginator) {
    paginator.find('.previous > a').click(async function (e) {
      e.preventDefault();
      let parent = $(this).parents('ul').first();
      let current = parent.data('page-current');
      let previous = parent.data('page-previous');
      let bundle = $(this).data('bundle');
      let field = $(this).data('field');
      let type = $(this).data('type');
      let search = $(`.search-entity[data-field="${field}"][data-bundle="${bundle}"][data-type="${type}"]`).val();
      let entities = await getEntities(bundle, type, previous * 2, search);

      if (entities && entities.data) {
        let itemsList = $('.field-' + field + '.entity.' + bundle + ' .type.' + type + ' > .items');
        itemsList.html('');
        $.each(entities.data, function (_, data) {
          let picked = getPickedItem(field, data._id.$oid) ? true : false;
          itemsList.append(
            getTemplate(field, bundle, type, data, picked)
          );
          clickAction(field, data);
        });

        if (entities.data.length >= 2) {
          previous = current == 1 ? 0 : previous - 1;
          buildPaginator(paginator, field, bundle, type, current - 1, previous, current);
          return;
        }
      }
    });

    paginator.find('.next > a').click(async function (e) {
      e.preventDefault();
      let parent = $(this).parents('ul').first();
      let current = parent.data('page-current');
      let next = parent.data('page-next');
      let previous = parent.data('page-previous');
      let bundle = $(this).data('bundle');
      let field = $(this).data('field');
      let type = $(this).data('type');
      let search = $(`.search-entity[data-field="${field}"][data-bundle="${bundle}"][data-type="${type}"]`).val();
      let entities = await getEntities(bundle, type, next * 2, search);

      if (entities && entities.data) {
        let itemsList = $('.field-' + field + '.entity.' + bundle + ' .type.' + type + ' > .items');
        itemsList.html('');
        $.each(entities.data, function (_, data) {
          let picked = getPickedItem(field, data._id.$oid) ? true : false;
          itemsList.append(
            getTemplate(field, bundle, type, data, picked)
          );
          clickAction(field, data);
        });

        if (entities.data.length >= 2) {
          buildPaginator(paginator, field, bundle, type, current + 1, current, next + 1);
          return;
        }

        buildPaginator(paginator, field, bundle, type, current + 1, current, current + 1);
        return;
      }
      buildPaginator(paginator, field, bundle, type, current, previous, current);
      return;
    });

  }

  async function getEntities(bundle, type, skip = 0, title = "") {
    let result = null;
    await $.ajax({
      url: '/entity-reference/' + bundle + '/' + type + '?skip=' + skip + '&limit=' + 2 + '&title=' + title,
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

  function search() {
    let typingTimer;
    let doneTypingInterval = 1200;

    $('.search-entity').keyup(function () {
      clearTimeout(typingTimer);
      let title = $(this).val();
      let bundle = $(this).data('bundle');
      let field = $(this).data('field');
      let type = $(this).data('type');

      typingTimer = setTimeout(searchEntity, doneTypingInterval, {
        title: title,
        bundle: bundle,
        field: field,
        type: type,
      });

    });
  }

  async function searchEntity(filter) {
    let entities = await getEntities(filter.bundle, filter.type, 0, filter.title);
    let itemsList = $('.field-' + filter.field + '.entity.' + filter.bundle + ' .type.' + filter.type + ' > .items');
    let paginator = itemsList.next('.paginator');

    if (entities && entities.data) {
      itemsList.html('');
      $.each(entities.data, function (_, data) {
        let picked = getPickedItem(filter.field, data._id.$oid) ? true : false;
        itemsList.append(
          getTemplate(filter.field, filter.bundle, filter.type, data, picked)
        );
        clickAction(filter.field, data);
      });

      if (entities.data.length >= 2) {
        buildPaginator(paginator, filter.field, filter.bundle, filter.type, 0, 0, 1);
        return;
      }
      paginator.html('');
      return;
    }
    paginator.html('');
    itemsList.html('');
    return;
  }

  function refreshEntities() {
    $('.refresh > a').click(async function (e) {
      e.preventDefault();
      let bundle = $(this).data('bundle');
      let field = $(this).data('field');
      let type = $(this).data('type');
      let entities = await getEntities(bundle, type);
      $(`.search-entity[data-field="${field}"][data-bundle="${bundle}"][data-type="${type}"]`).val('');

      if (entities && entities.data) {
        let itemsList = $('.field-' + field + '.entity.' + bundle + ' .type.' + type + ' > .items');
        itemsList.html('');
        $.each(entities.data, function (_, data) {
          let picked = getPickedItem(field, data._id.$oid) ? true : false;
          itemsList.append(
            getTemplate(field, bundle, type, data, picked)
          );
          clickAction(field, data);
        });

        if (entities.data.length >= 2) {
          let paginator = itemsList.next('.paginator');
          buildPaginator(paginator, field, bundle, type, 0, 0, 1);
        }
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