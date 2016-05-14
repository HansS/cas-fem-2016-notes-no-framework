
/**
*  Model holds data with access and modify methods.  
*  register() adds items to subject.  When model state 
*  changes calls subject.notifyObservers() to redraw list.
*/
function ToDoModel() {
    const subject = Subject(),
        list = [];
    return {
        getList: function() {
            return list;
        },
        add: function (text) {
            list.push({ 
                val: text, 
                complete: false
            });
            subject.notifyObservers();
        },
        remove: function(index) {
            list.splice(index, 1);
            subject.notifyObservers();
        },
        complete: function(index, isComplete) {
            isComplete === true ?
                list[index].complete = true :
                list[index].complete = false;
            subject.notifyObservers();
        },
        // observer
        register: function(...args) {
            subject.removeAll();
            args.forEach(elem => {
                subject.add(elem);
            });
        }
    };
}

/**
*  View handle output to template.  On init gets DOM refs,
*  and expose to controller.  When model calls notify(), 
*  View queries model for data and data performs pres. logic.
*/
function ToDoView(model) {
    const DOM = {
        input: $('#todo-input'),
        list: $('#todo-list')
    },
    templateFnc = 
             Handlebars.compile($('#todo-template').html());

    function getData() {
         // presentation logic
         function isChecked(elem) {
              return elem.complete === true ? 'checked': '';
         }
         return model.getList().map(function(elem, index) {
             return {
                val: elem.val,
                checked: isChecked(elem)
            };
        });
    }
    return {
        getDOM: function() {
            return DOM;
        },
        notify: function() {
            const html = templateFnc({ view_list: getData() });
            DOM.list.html(html);
         }
    };          
}

/**
*  Controllers handle input.  Gets DOM refs from View.
*  then sets event handlers for input text box to add new item

*  Performs register() of both View and itself
*  set up list checkbox and 
*  remove click event handlers
*  after DOM rebuilt.
*/
function ToDoCtrl(view, model) {
    const DOM = view.getDOM();
    // input handler
    DOM.input.blur(() => {
        model.add(DOM.input.val());
    });
    DOM.input.keyup((ev) => {
        if (ev.which == 13 || ev.keyCode == 13) {
            DOM.input.blur();
        }
    });
    model.register(view, this);
    return {
        notify: function() {
            const that = this;
            // checkbox handlers
            DOM.list.find('.input').each(function(index) {
                $(this).click(() => {
                    that.model.complete(index, $(this).is(':checked')); 
                });
            });
            // remove handlers
            DOM.list.find('.remove').each(function(index) {
                $(this).click(() => {
                    that.model.remove(index); 
                });
            });
        }
    };
}


/**
*  Simple pull observer pattern for change notification.
*/
function Subject() {
    const observers = [];
    return {    
        add: function(item) {
            observers.push(item);
        },
        removeAll: function() {
            observers.length = 0;
        },
        notifyObservers() {
            observers.forEach(elem => {
                elem.notify();
            });
        }
    };
}