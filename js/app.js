$(function() {
    var btOptions = {
        columns: [
            {
                field: 'id', title: 'id'
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

    var $bt = $('#bt-table');

    $bt.bootstrapTable('destroy').bootstrapTable(btOptions);

    $('#upsertModal').editableModal({
        table: $bt,
        btOptions: btOptions,
        endpoint: '/post/data',
        buttons: {
            close: $('#closeModal'),
            save: $('#saveChanges')
        }
    });

    //ajax emulation
    $.mockjax({
        url: '/post/data',
        responseTime: 1000,
        response: function(settings) {
            this.responseText = {
                success: true,
                msg: 'Created!',
                id: 100
            };
        }
    });


});
