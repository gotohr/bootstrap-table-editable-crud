# bootstrap-table-editable-crud
* refer to [Bootstrap Table Editable plugin](https://github.com/wenzhixin/bootstrap-table/tree/master/src/extensions/editable)
* depends on [underscore.js](http://underscorejs.org/)

## Development
* go to public folder and `bower install`
* in project root folder `php -S localhost:8888 -t .`

## Usage

    <script src="/somewhere/in/your/assets/bootstrap-table-editable-crud.js"></script>

(open `js/app.js` to see example)

`.editableCRUD` should be attached to modal panel by default
    
    var crud = $('#upsertModal').editableCRUD(
    
but if you don't want to use modal panel for editing then attach `.editableCRUD` to bootstrap table, ie:

    var $table = $('#table-id').bootstrapTable(btOptions);
    var crud = $table.editableCRUD(...);

notice using events `success` and `fail` to display messages.

    crud.on('success', function(e, response, record) {
        $.notify(response.msg, 'success');
    });
    
    crud.on('fail', function(e, response, record) {
        $.notify(response.msg);
    });

IMPORTANT: add `data-unique-id="id"` to table!

### Creating action column 
involves `formatter` on some column (doesn't need to be `id` column, as formatter function has signature `(value, row)`)

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
    }
    
in crud configuration define `delete` action selector

     buttons: {
         close: '#closeModal',
         save: '#saveChanges',
         delete: 'button.delete'
     }
        
## Features
* create - works (POST)
* read (well, obviously, this is supported by bootstrap-table...) 
* update - works via cell editing (PUT)
* delete 
    

## Todo
* extend bootstrap-table constructor and events? (like bootstrap-table-editable)
* read bootstrap-table options directly from bootstrap-table instead of using bt passed parameters object
* catch bootstrap-table event onLoad (or something) to initialize delete/edit buttons
* setup editables every time modal is shown
* spinner on action buttons (edit/delete)
* spinner on save action button in modal?
* edit action button rendering (if edit turned on via options?)