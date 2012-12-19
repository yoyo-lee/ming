/*global jQuery, Handlebars */
define(function(require, exports, module) {
	'use strict';
    var $ = require('$');
    var template = require('../../../src/template/template');
    var Utils = require('utils');

	var App = {
		init: function() {
			this.ENTER_KEY = 13;
			this.todos = Utils.store('todos-jquery');
			this.cacheElements();
			this.bindEvents();
			this.render();
		},
		cacheElements: function() {
			this.todoTemplate = template( $('#todo-template').html() );
			this.footerTemplate = template( $('#footer-template').html() );
			this.$todoApp = $('#todoapp');
			this.$newTodo = $('#new-todo');
			this.$toggleAll = $('#toggle-all');
			this.$main = $('#main');
			this.$todoList = $('#todo-list');
			this.$footer = this.$todoApp.find('#footer');
			this.$count = $('#todo-count');
			this.$clearBtn = $('#clear-completed');
		},
		bindEvents: function() {
			var list = this.$todoList;
			this.$newTodo.on( 'keyup', this.create );
			this.$toggleAll.on( 'change', this.toggleAll );
			this.$footer.on( 'click', '#clear-completed', this.destroyCompleted );
			list.on( 'change', '.toggle', this.toggle );
			list.on( 'dblclick', 'label', this.edit );
			list.on( 'keypress', '.edit', this.blurOnEnter );
			list.on( 'blur', '.edit', this.update );
			list.on( 'click', '.destroy', this.destroy );
		},
		render: function() {
            debugger;
			this.$todoList.html( this.todoTemplate( { todos: this.todos } ) );
			this.$main.toggle( !!this.todos.length );
			this.$toggleAll.prop( 'checked', !this.activeTodoCount() );
			this.renderFooter();
			Utils.store( 'todos-jquery', this.todos );
		},
		renderFooter: function() {
			var todoCount = this.todos.length,
				activeTodoCount = this.activeTodoCount(),
				footer = {
					activeTodoCount: activeTodoCount,
					activeTodoWord: Utils.pluralize( activeTodoCount, 'item' ),
					completedTodos: todoCount - activeTodoCount
				};

			this.$footer.toggle( !!todoCount );
			this.$footer.html( this.footerTemplate( footer ) );
		},
		toggleAll: function() {
			var isChecked = $( this ).prop('checked');
			$.each( App.todos, function( i, val ) {
				val.completed = isChecked;
			});
			App.render();
		},
		activeTodoCount: function() {
			var count = 0;
			$.each( this.todos, function( i, val ) {
				if ( !val.completed ) {
					count++;
				}
			});
			return count;
		},
		destroyCompleted: function() {
			var todos = App.todos,
				l = todos.length;
			while ( l-- ) {
				if ( todos[l].completed ) {
					todos.splice( l, 1 );
				}
			}
			App.render();
		},
		// Accepts an element from inside the ".item" div and
		// returns the corresponding todo in the todos array
		getTodo: function( elem, callback ) {
			var id = $( elem ).closest('li').data('id');
			$.each( this.todos, function( i, val ) {
				if ( val.id === id ) {
					callback.apply( App, arguments );
					return false;
				}
			});
		},
		create: function(e) {
			var $input = $(this),
				val = $.trim( $input.val() );
			if ( e.which !== App.ENTER_KEY || !val ) {
				return;
			}
			App.todos.push({
				id: Utils.uuid(),
				title: val,
				completed: false
			});
			$input.val('');
			App.render();
		},
		toggle: function() {
			App.getTodo( this, function( i, val ) {
				val.completed = !val.completed;
			});
			App.render();
		},
		edit: function() {
			$(this).closest('li').addClass('editing').find('.edit').focus();
		},
		blurOnEnter: function( e ) {
			if ( e.keyCode === App.ENTER_KEY ) {
				e.target.blur();
			}
		},
		update: function() {
			var val = $.trim( $(this).removeClass('editing').val() );
			App.getTodo( this, function( i ) {
				if ( val ) {
					this.todos[ i ].title = val;
				} else {
					this.todos.splice( i, 1 );
				}
				this.render();
			});
		},
		destroy: function() {
			App.getTodo( this, function( i ) {
				this.todos.splice( i, 1 );
				this.render();
			});
		}
	};

    return App;

});
