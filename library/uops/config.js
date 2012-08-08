// initialze icon loader (further details see ./ux/IconLoader.js)
Ext.ux.IconLoader.initialize({
	path : '/icons/'
});

/* Ext.DATA */
Ext.override(Ext.data.Field, {
	/* use default dateFormat on fields to avoid wrong time +1 offset */
	dateFormat : 'Y-m-d',
	// Use when converting received data into a INT, FLOAT, BOOL or STRING type.
	// If the value cannot be
	// parsed, `null` will be used if useNull is true, otherwise a default value
	// for that type will be used:
	// Introduced in Ext 3.x (my support ticket) to solve issues with unset
	// prices
	// form compatibility it is false on default, but for security it should be
	// true!!!
	useNull : true
});

Ext.override(Ext.data.proxy.Server, {
	// prefix all names by '_' to allow differ between data and ext meta
	// information
	pageParam : '_page',
	startParam : '_start',
	limitParam : '_limit',
	groupParam : '_group',
	groupDirectionParam : '_groupDir',
	sortParam : '_sort',
	filterParam : '_filter',
	directionParam : '_dir'
});

Ext.override(Ext.data.Store, {
	// use pagesize of 10 (default: 25)
	defaultPageSize : 10
});

/* Ext.FORM */
Ext.override(Ext.form.action.Action, {
	// If set to true (default), the emptyText value will be sent with the form
	// when it is submitted.
	// now you can use emptyText for additional hint that will not be send to
	// server
	submitEmptyText : false
});

Ext.override(Ext.form.field.Base, {
	// automatically insert red '*' for field labels that are mandatory
	afterLabelTextTpl : new Ext.XTemplate(
		// <sup>*</sup>
		'<tpl if="allowBlank === false">',
		'<span class="required" data-qtip="Required">*</span></tpl>', 
		{
			disableFormats : true
		}
	)
});

Ext.override(Ext.form.field.Checkbox, {
	// The value that should go into the generated input element's value
	// attribute and should be used as the parameter value when submitting as
	// part of a form. Defaults: on
	inputValue : 1,
	// If configured, this will be submitted as the checkbox's value during form
	// submit if the checkbox is unchecked. By default this is undefined, which
	// results in nothing being submitted for the checkbox field when the form
	// is submitted (the default behavior of HTML checkboxes).
	uncheckedValue : 0
});

Ext.override(Ext.form.field.Date, {
	// The date format string which will be submitted to the server.
	// The format must be valid according to Ext.Date.parse.
	submitFormat : 'Y-m-d'
});

Ext.override(Ext.form.field.Number, {
	// False to ensure that the getSubmitValue method strips always uses
	// . as the separator, regardless of the decimalSeparator configuration.
	submitLocaleSeparator : false
});

Ext.override(Ext.form.field.Text, {
	// True to set the maxLength property on the underlying input field
	// Result: you can only enter maxLength chars into field
	enforceMaxLength : true
});