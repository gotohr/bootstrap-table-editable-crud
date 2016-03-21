/**
 * @author Ljubo Čanić <ljubo@mentat-labs.com>
 */

!function ($) {

    'use strict';

    $.fn.editableModal = function(options) {

        this.settings = $.extend( true, $.fn.editableModal.defaults, options );

        if (this.settings.table === undefined) throw "editableModel expects 'table' option!";
        if (this.settings.btOptions === undefined) throw "editableModel expects 'btOptions' (bootstrap-table options object with columns)!";
        if (this.settings.endpoint === undefined) throw "editableModel expects 'endpoint' option!";

        var that = this;
        var idField = this.settings.table.bootstrapTable('getOptions').idField;
        this.idField = idField = idField ? idField : 'id';

        var editables = _(this.settings.btOptions.columns).chain()
            .map(function(column) {
                return _(column.editable).extend({
                    field: column.field,
                    mode: that.settings.mode
                });
            }).compact().value();

        var columnNames = _(editables).pluck('field');

        var EditableFields = {
            tableTpl: _.template('<table class="table table-bordered table-striped" style="clear: both"><%= rows %></table>'),
            rowTpl: _.template('<tr><td><%= label %></td><td><%= editable %></td></tr>'),
            fieldTpl: _.template('<a href="#" id="<%= field %>" data-type="<%= type %>" data-title="<%= title %>"></a>'),
            renderRows: function(editables) {
                return _(editables).chain()
                    .map(function(editable){
                        return EditableFields.rowTpl({
                            label: editable.title,
                            editable: EditableFields.fieldTpl(editable)
                        });
                    })
                    .value().join('');
            },
            renderTable: function() {
                var fieldsHtml = EditableFields.renderRows(editables);
                return EditableFields.tableTpl({rows: fieldsHtml});
            }
        };

        this.find('.modal-body').html(EditableFields.renderTable());

        _(editables).each(function(edt) {
            $('#' + edt.field)
                .editable(edt)
                .editable('setValue', edt.default);
        });

        var rowSnapshot;
        this.settings.table.on('editable-shown.bs.table', function (e, name, record) {
            rowSnapshot = _(record).pick(columnNames);
        });

        this.settings.table.on('editable-save.bs.table', function (e, name, record) {
            var rec = that.settings.preSaveData(rowSnapshot, _(record).pick(columnNames));
            $.post(that.settings.endpoint, JSON.stringify(rec),
                function (response) {
                    that.settings.success.call(that, response, record);
                }).fail(function (response) {
                    that.settings.fail.call(that, response, record);
                }
            );
        });

        this.revertLocalUpdate = function (rec) {
            var data = that.settings.table.bootstrapTable('getData'),
                index = _(data).chain().pluck('id').indexOf(rec[idField]).value();
            that.settings.table.bootstrapTable('updateRow', {index: index, row: rowSnapshot});
        };

        this.settings.buttons.save.click(function() {
            var values = _(editables).map(function(edt) {
                return $('#' + edt.field).editable('getValue', edt.default)[edt.field];
            });
            var newRecordData = _.object(columnNames, values);
            var record = that.settings.preSaveData({}, newRecordData);

            // todo implement update
            // var data = that.settings.table.bootstrapTable('getData'),
            //     index = _(data).chain().pluck(idField).indexOf(record[idField]).value(),
            //     update = {index: index, row: record};

            $.post(that.settings.endpoint, JSON.stringify(record),
                function (response) {
                    if (that.settings.success.call(that, response, record)) {
                        record[idField] = response[idField];
                        that.settings.table.bootstrapTable('append', record);
                    }
                    that.settings.buttons.close.click();
                }).fail(function (response) {
                    that.settings.fail.call(that, response, record);
                    that.settings.buttons.close.click();
                }
            );

        });

        return this;
    };

    $.fn.editableModal.defaults = {
        mode: 'inline',
        preSaveData: function(oldData, newData) {
            return newData;
        },
        success: function (response, record) {
            if (response.success) {
                return true;
            } else {
                record[this.idField] && (this.revertLocalUpdate(record));
            }
        },
        fail: function (response, record) {
            record[this.idField] && (this.revertLocalUpdate(record));
        }
    };

}(jQuery);
