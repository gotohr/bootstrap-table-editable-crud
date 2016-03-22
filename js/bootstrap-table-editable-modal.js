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
        this.idField = idField = idField ? idField : this.settings.idField;

        // todo read columns and editable metadata from bootstrap-table
        // todo look in bootstrap-table-editable to extend bootstrap-table
        var editables = _(this.settings.btOptions.columns).chain()
            .map(function(column) {
                return _(column.editable).extend({
                    field: column.field,
                    mode: that.settings.mode
                });
            }).compact().value();

        // todo fieldTpl id attribute should be namespaced?
        // render table with key vals
        var EditableFields = {
            tableTpl: _.template('<table class="table table-bordered table-striped" style="clear: both"><%= rows %></table>'),
            rowTpl: _.template('<tr><td class="widthLabel"><%= label %></td><td class="widthValue"><%= editable %></td></tr>'),
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

        // todo dump html to settings.container
        this.find('.modal-body').html(EditableFields.renderTable());

        // label/value width
        this.find('.table .widthLabel').css({width: this.settings.widthLabel});
        this.find('.table .widthValue').css({width: this.settings.widthValue});

        // setup editables
        _(editables).each(function(editable) {
            $('#' + editable.field) // todo reference fields via something else
                .on('hidden', that.settings.autoNext ? that.settings.showNextEditable : function() {}) // go to next editable field or override with empty function
                .editable(editable)
                .editable('setValue', editable.default)
        });

        var columnNames = _(editables).pluck('field');

        // todo update row
        var rowSnapshot;
        this.settings.table.on('editable-shown.bs.table', function (e, name, record) {
            // console.log('bt table make row snapshot (editable-shown.bs.table)', e, name, record);
            rowSnapshot = _(record).pick(columnNames);
            rowSnapshot[idField] = record[idField];
        });

        // post to server after bt table editable saved (data changed)
        this.settings.table.on('editable-save.bs.table', function (e, name, record) {
            // console.log('bt table editable-save.bs.table', e, name, record);
            var rec = that.settings.preSaveData(rowSnapshot, _(record).pick(columnNames));
            rec[idField] = rowSnapshot[idField];
            $.post(that.settings.endpoint, JSON.stringify(rec),
                function (response) {
                    that.settings.success.call(that, response, rec);
                }).fail(function (response) {
                    that.settings.fail.call(that, response, rec);
                }
            );
        });

        // handle revert if update gone wrong
        this.revertLocalUpdate = function (rec) {
            var data = that.settings.table.bootstrapTable('getData'),
                index = _(data).chain().pluck('id').indexOf(rec[idField]).value();
            that.settings.table.bootstrapTable('updateRow', {index: index, row: rowSnapshot});
        };

        // create button clicked
        this.settings.buttons.save.click(function() {
            var editableValues = _(editables).map(function(edt) {
                return $('#' + edt.field)
                    .editable('getValue', edt.default)[edt.field];
            });

            var newRecord = that.settings.preSaveData({}, _.object(columnNames, editableValues));

            // todo implement update
            // var data = that.settings.table.bootstrapTable('getData'),
            //     index = _(data).chain().pluck(idField).indexOf(newRecord[idField]).value(),
            //     update = {index: index, row: newRecord};

            $.post(that.settings.endpoint, JSON.stringify(newRecord),
                function (response) {
                    if (that.settings.success.call(that, response, newRecord)) {
                        newRecord[idField] = response[idField];
                        that.settings.table.bootstrapTable('append', newRecord);
                    }
                    that.settings.buttons.close.click();
                }).fail(function (response) {
                    that.settings.fail.call(that, response, newRecord);
                    that.settings.buttons.close.click();
                }
            );

        });

        return this;
    };

    $.fn.editableModal.defaults = {
        mode: 'inline',
        idField: 'id',
        widthLabel: '30%',
        widthValue: '70%',
        autoNext: false,
        showNextEditable: function(e, reason) {
            var $next = $(this).closest('tr').next().find('.editable');
            setTimeout(function() {
                $next.editable.enabledShow = $next.editable('show');
            }, 100);
        },
        preSaveData: function (oldData, newData) {
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
