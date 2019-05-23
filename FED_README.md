# Front End Developer Notes

This README contains information on any FED specific details that might be needed in developing a site.

## SVG Sprite Module

The SVG sprite module customization allows the developer to include an SVG on the page. SVG's must be added to
static/default/svg-icons to be included in the sprite file. You can utilize the sprites using one of the following methods:

### SVG ISML Module

```html
<issvg icon="[icon-name]" hidden="[boolean]" showBackground="[boolean]" classes="[string]" />
```

#### Module Properties
- `icon`: Name of the icon to render (do no include svg extension)
- `hidden`: Adds aria-hidden="true" to the SVG markup if set to true
- `showBackground`: Adds a div wrapper with the class "icon-background" around the SVG markup
- `classes`: Adds the given string of classes to the SVG markup

### CSS Background

The SVG icons can be used as a background image by adding the following classes to an HTML element:

```html
<i class="icon-[icon-name]-bg icon-[icon-name]-dims"></i>
```