'use strict';

(function ($) {
	'use strict';

	/**
  * The jQuery plugin
  */

	$.tristateCheckboxGroup = function (data) {

		(function traverse(data, parent) {
			checkboxSource.addCheckbox(data.checkbox, parent);
			data.child.forEach(function (child) {
				traverse(child, data.checkbox);
			});
		})(data, null);
	};

	/**
  * Factory to create checkbox node
  */
	function makeCheckboxNode(checkbox, parentNode) {
		return {
			checkbox: checkbox,
			parentNode: parentNode,
			childNodes: []
		};
	}

	/**
  * Source where all the provided checkboxes are stored in a tree structure
  */
	var checkboxSource = function () {

		var checkboxTreeList = [];
		var listenerMap = new Map();

		/**
   * Attaches the listener to the checkbox
   */
		function attachListener(checkbox, node) {
			var listener = function listener() {
				var checked = $(node.checkbox).prop('checked');
				notifyChild(node, checked);
				notifyParent(node);
			};
			$(checkbox).on('change', listener);
			listenerMap.set(checkbox, listener);
		}

		/**
   * Detaches the listener from the checkbox
   */
		function detachListener(checkbox) {
			var listener = listenerMap.get(checkbox);
			$(checkbox).unbind('change', listener);
			listenerMap.delete(checkbox);
		}

		/**
   * Notifies parent node of a node if available
   */
		function notifyParent(node, checked) {

			if (node.parentNode !== null) {
				var allChecked = node.parentNode.childNodes.every(function (node) {
					return $(node.checkbox).prop('checked');
				});
				var allNotChecked = node.parentNode.childNodes.every(function (node) {
					return !$(node.checkbox).prop('checked');
				});
				var someIndeterminate = node.parentNode.childNodes.some(function (node) {
					return $(node.checkbox).prop('indeterminate');
				});
				$(node.parentNode.checkbox).prop('checked', allChecked);
				$(node.parentNode.checkbox).prop('indeterminate', someIndeterminate || !(allChecked || allNotChecked));
				notifyParent(node.parentNode);
			}
		}

		/**
   * Notifies all the child nodes of a node
   */
		function notifyChild(node, checked) {

			node.childNodes.forEach(function (childNode) {
				var childChecked = $(childNode.checkbox).prop('checked');
				if (childChecked !== checked) {
					$(childNode.checkbox).prop('checked', checked);
					notifyChild(childNode, checked);
				}
			});
		}

		/**
   * Find and return the node in the tree
   */
		function getCheckboxNode(checkbox) {

			var ret = function findCheckboxNode() {
				var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

				if (node === null) {
					for (var i = 0; i < checkboxTreeList.length; i++) {
						var foundNode = findCheckboxNode(checkboxTreeList[i]);
						if (foundNode !== null) {
							return foundNode;
						}
					}
				} else if (node.checkbox === checkbox) {
					return node;
				} else {
					for (var _i = 0; _i < node.childNodes.length; _i++) {
						var _foundNode = findCheckboxNode(node.childNodes[_i]);
						if (_foundNode !== null) {}{
							return _foundNode;
						}
					}
				}
				return null;
			}();
			return ret ? ret : null;
		}

		/**
   * Creates a node from the checkbox and adds to the tree
   */
		function addCheckbox(checkbox) {
			var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


			var checkboxNode = getCheckboxNode(checkbox);

			if (checkboxNode !== null) {
				console.error('checkbox ', checkbox, ' already added to the source');
				return false;
			}

			var newNode = void 0;
			if (parent === null) {
				newNode = makeCheckboxNode(checkbox, null);
				checkboxTreeList.push(newNode);
			} else {
				var parentNode = getCheckboxNode(parent);
				newNode = makeCheckboxNode(checkbox, parentNode);
				parentNode.childNodes = parentNode.childNodes.concat(newNode);
			}

			attachListener(checkbox, newNode);
			return true;
		}

		/**
   * Removes the node containing the checkbox from the tree
   */
		function removeCheckbox(checkbox) {

			var node = getCheckboxNode(checkbox);

			if (node === null) {
				console.error('checkbox ', checkbox, 'not found');
				return false;
			}

			if (node.parentNode !== null) {
				node.parentNode.childNodes = node.parentNode.childNodes.filter(function (node) {
					return node.checkbox !== checkbox;
				});
			} else {
				checkboxTreeList.filter(function (node) {
					return node.checkbox !== checkbox;
				});
			}

			detachListener(checkbox);
			return true;
		}

		return {
			addCheckbox: addCheckbox,
			removeCheckbox: removeCheckbox
		};
	}();
})(jQuery);
