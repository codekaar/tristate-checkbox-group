(function($) {
	'use strict';

	/**
	 * The jQuery plugin
	 */
	$.tristateCheckboxGroup = function(data) {

		(function traverse(data, parent) {
			checkboxSource.addCheckbox(data.checkbox, parent);
			data.child.forEach((child) => {
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
			childNodes: [],
		};
	}

	/**
	 * Source where all the provided checkboxes are stored in a tree structure
	 */
	let checkboxSource = (function () {

		let checkboxTreeList = [];
		let listenerMap = new Map();

		/**
		 * Attaches the listener to the checkbox
		 */
		function attachListener(checkbox, node) {
			let listener = () => {
				let checked = $(node.checkbox).prop('checked');
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
			let listener = listenerMap.get(checkbox);
			$(checkbox).unbind('change', listener);
			listenerMap.delete(checkbox);
		}

		/**
		 * Notifies parent node of a node if available
		 */
		function notifyParent(node, checked) {

			if (node.parentNode !== null) {
				let allChecked = node.parentNode.childNodes.every(node => $(node.checkbox).prop('checked'));
				let allNotChecked = node.parentNode.childNodes.every(node => ! $(node.checkbox).prop('checked'));
				let someIndeterminate = node.parentNode.childNodes.some(node => $(node.checkbox).prop('indeterminate'));
				$(node.parentNode.checkbox).prop('checked', allChecked);
				$(node.parentNode.checkbox).prop('indeterminate', someIndeterminate || ! (allChecked || allNotChecked));
				notifyParent(node.parentNode);
			}
		}

		/**
		 * Notifies all the child nodes of a node
		 */
		function notifyChild(node, checked) {

			node.childNodes.forEach(childNode => {
				let childChecked = $(childNode.checkbox).prop('checked');
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

			let ret = (function findCheckboxNode(node = null) {
				if (node === null) {
					for (let i = 0; i < checkboxTreeList.length; i++) {
						let foundNode = findCheckboxNode(checkboxTreeList[i]);
						if (foundNode !== null) {
							return foundNode;
						}
					}
				}
				else if (node.checkbox === checkbox) {
					return node;
				}
				else {
					for (let i = 0; i < node.childNodes.length; i++) {
						let foundNode = findCheckboxNode(node.childNodes[i]);
						if (foundNode !== null) {} {
							return foundNode;
						}
					}
				}
				return null;
			})();
			return ret ? ret : null;
		}

		/**
		 * Creates a node from the checkbox and adds to the tree
		 */
		function addCheckbox(checkbox, parent = null) {

			let checkboxNode = getCheckboxNode(checkbox);
			
			if (checkboxNode !== null) {
				console.error('checkbox ', checkbox, ' already added to the source');
				return false;
			}

			let newNode;
			if (parent === null) {
				newNode = makeCheckboxNode(checkbox, null);
				checkboxTreeList.push(newNode);
			}
			else {
				let parentNode = getCheckboxNode(parent);
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
			
			let node = getCheckboxNode(checkbox);
			
			if (node === null) {
				console.error('checkbox ', checkbox, 'not found');
				return false;
			}
			
			if (node.parentNode !== null) {
				node.parentNode.childNodes = node.parentNode.childNodes.filter(node => node.checkbox !== checkbox);
			} else {
				checkboxTreeList.filter(node => node.checkbox !== checkbox);
			}
			
			detachListener(checkbox);
			return true;
		}

		return {
			addCheckbox: addCheckbox,
			removeCheckbox: removeCheckbox,
		};
	})();
})(jQuery);
