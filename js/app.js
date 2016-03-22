$(function() {
    var btOptions = {
        columns: [
            {
                field: 'id', title: 'id', visible: true,
                align: 'center', valign: 'middle',
                formatter: function(val) {
                    return [
                        '<button type="button" class="delete btn btn-danger btn-xs" data-value="' + val + '">',
                            'Delete',
                        '</button>'
                    ].join('');
                }
            },
            {
                field: 'isActive', title: 'Active?', align: 'center', valign: 'middle',
                editable: {
                    type: 'select',
                    title: 'Activate/deactivate',
                    source: [
                        { value: 1, text: 'Active' },
                        { value: 0, text: 'Deactivated' }
                    ],
                    default: 1
                }
            },
            {
                field: 'name', title: 'Name', align: 'left', valign: 'middle',
                editable: {
                    type: 'text',
                    title: 'Name',
                    default: 'New user'
                }
            },
            {
                field: 'group', title: 'Group', align: 'left', valign: 'middle',
                editable: { type: 'select', title: 'Group',
                    emptyText: 'None',
                    source: [
                        { value: 1, text: 'Group 1' },
                        { value: 2, text: 'Group 2' },
                        { value: 3, text: 'Group 3' },
                        { value: 4, text: 'Group 4' }
                    ],
                    default: null
                }
            },
            {
                field: 'module', title: 'Modules', ignore: false, align: 'left', valign: 'middle',
                editable: {
                    type: 'checklist',
                    title: 'Pick modules',
                    source: [
                        {value: 1, text: 'Module 1'},
                        {value: 2, text: 'Module 2'},
                        {value: 3, text: 'Module 3'},
                        {value: 4, text: 'Module 4'}
                    ],
                    default: [1, 2]
                }
            }
        ]
    };

    var $bt = $('#bt-table').bootstrapTable('destroy').bootstrapTable(btOptions);

    var crud = $('#upsertModal').editableCRUD({
        table: $bt,
        btOptions: btOptions,
        endpoint: '/endpoint',
        buttons: {
            close: '#closeModal',
            save: '#saveChanges',
            delete: '#bt-table button.delete'
        }
    });

    crud.on('success', function(e, response, record) {
        console.log('triggered success');
        $.notify(response.msg, 'success');
    });

    crud.on('fail', function(e, response, record) {
        console.log('triggered fail');
        $.notify(response.msg);
    });

    //ajax emulation
    $.mockjax({
        url: '/endpoint',
        responseTime: 1000,
        response: function(settings) {
            var data = eval('(' + settings.data + ')');
            var that = this;
            var map = {
                POST: function() {
                    that.responseText = {
                        success: true,
                        msg: 'Created!',
                        id: 0
                    };
                },
                PUT: function() {
                    that.responseText = {
                        success: true,
                        msg: 'Updated!',
                        id: data.id
                    };
                },
                DELETE: function() {
                    that.responseText = {
                        success: true,
                        msg: 'Deleted!',
                        id: data.id
                    };
                }
            };
            map[settings.type]();
            console.log('settings', settings);
            console.log('this.responseText', this.responseText);
        }
    });


});
