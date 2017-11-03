# Usage

1. Include _dist/index.js_ (or _index.min.js_)
2. Run `$.tristateCheckboxGroup()`

## Example

```javascript
let master = $('input.chk-master');
let children = $();
$.tristateCheckboxGroup({
	'checkbox': {}, // checkbox DOM object
	'child': [{
		'checkbox': {},
		'child': [],
	}],
});
```

See the _test.html_ for example.

## Data Format

The data is a tree structure. Every element is of following structure:

```javascript
{
	'checkbox': {}, // checkbox DOM object
	'child': [],
}
```

## Dependencies

1. jQuery

# Development

1. Run `npm install` to install all dependencies
1. Make changes to the file in _src_ folder
1. Run `build` command
1. Open _dist/test.html_ in browser

## Build

Generate the files in _dist_ folder.

```bash
npm run build
```

## Watch

Runs build as changes is made in files of _src_ folder.

```bash
npm run watch
```

## More
See _package.json_ for available scripts
