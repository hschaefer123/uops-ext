/**
 * @class Ext.ux.grid.Printer
 * @author Ed Spencer (edward@domine.co.uk)
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated
 * 
 * Usage:
 * 
 * 1 - Add Ext.Require Before the Grid code
 * Ext.require([
 *   'Ext.ux.grid.GridPrinter',
 * ]);
 * 
 * 2 - Declare the Grid 
 * var grid = Ext.create('Ext.grid.Panel', {
 *   columns: //some column model,
 *   store   : //some store
 * });
 * 
 * 3 - Print!
 * Ext.ux.grid.Printer.mainTitle = 'Your Title here'; //optional
 * Ext.ux.grid.Printer.print(grid);
 * 
 * Original url: http://edspencer.net/2009/07/printing-grids-with-ext-js.html
 * 
 * Modified by Loiane Groner (me@loiane.com) - September 2011 - Ported to Ext JS 4
 * http://loianegroner.com (English)
 * http://loiane.com (Portuguese)
 * 
 * Modified by Paulo Goncalves - March 2012
 * 
 * Modified by Beto Lima - March 2012
 * 
 * Modified by Beto Lima - April 2012
 *
 * Modified by Paulo Goncalves - May 2012
 * 
 * Modified by Nielsen Teixeira - 2012-05-02
 *
 * Modified by Joshua Bradley - 2012-06-01
 * 
 * Modified by Holger Schäfer - 2012-07-30
 *
 * FORUM: http://www.sencha.com/forum/showthread.php?146348-ExtJS-4-Grid-Printer-Plugin
 * GIT: https://github.com/loiane/extjs4-ux-gridprinter
 */
Ext.define("Ext.ux.grid.Printer", {   
    requires: [
               'Ext.XTemplate',
               'Ext.ux.IFrame'
	],
    statics: {
        /**
         * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
         * @param {Ext.grid.Panel} grid The grid to print
         */
        print: function(grid, targetEl) {
        	if (!targetEl) targetEl = Ext.getBody();
        	
            //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
            //the other to create the body (see the escaped {} below)
            var columns = [];
            //account for grouped columns
            Ext.each(grid.columns, function(c) {
                if (c.items.length > 0) {
                    columns = columns.concat(c.items.items);
                } else {
                    columns.push(c);
                }
            });

            //build a useable array of store data for the XTemplate
            var data = [];
            var emptyText = this.text;
            grid.store.data.each(function(item, row) {
                var convertedData = {};
                //apply renderers from column model
                for (var key in item.data) {
                    var value = item.data[key];
                    
                    Ext.each(columns, function(column, col) {
                        if (column && column.dataIndex == key) {
                            /*
                             * TODO: add the meta to template
                             */                        	                        	                        	
                            var meta = {item: '', tdAttr: '', tdCls: '', style: ''};                            
                            value = column.renderer 
                            	//? column.renderer.call(column, value, meta, item, row, col, grid.store, grid.view) 
                            	? column.renderer(value, meta, item, row, col, grid.store, grid.view)
                            	: value;
                            	
                        	// add style info
                            // TODO: find out how to use metahandling via template (above handling via renderer does not work)
                        	var align = column.align; // [left|center|right]
                        	var style = '';
                        	if (align  != 'left') {
                            	style += 'text-align:' + align + ';';
                        		value = '<div style="' + style + '">' + value + '</div>';
                        	}
                        	convertedData[column.id] = (Ext.isEmpty(value)) 
                        		? emptyText : value;
                        }
                    }, this);      
                }
                data.push(convertedData);
            });
            
            //remove columns that do not contains dataIndex or dataIndex is empty. for example: columns filter or columns button
            var clearColumns = [];
            Ext.each(columns, function(column) {
                if (column && !Ext.isEmpty(column.dataIndex) && !column.hidden) {
                    clearColumns.push(column);
                }
            });
            columns = clearColumns;
            
            //get Styles file relative location, if not supplied
            console.log(this.stylesheetPath);
            if (this.stylesheetPath === null) {
            	/*
                var scriptPath = Ext.Loader.getPath('Ext.ux.grid.Printer'); // library/extjs/src/ux/grid/Printer.js
                this.stylesheetPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'gridPrinterCss/print.css';
                */            	
            	this.stylesheetPath = '../resources/css/ux-grid-Printer.css';
            }

            //use the headerTpl and bodyTpl markups to create the main XTemplate below
            var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(columns);
            var body     = Ext.create('Ext.XTemplate', this.bodyTpl).apply(columns);
            var pluginsBody = '',
                pluginsBodyMarkup = [];
            
            //add relevant plugins
            Ext.each(grid.plugins, function(p) {
                if (p.ptype == 'rowexpander') {
                    pluginsBody += p.rowBodyTpl.join('');
                }
            });
            
            if (pluginsBody != '') {
                pluginsBodyMarkup = [
                    '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}"><td colspan="' + columns.length + '">',
                      pluginsBody,
                    '</td></tr>',
                ];
            }
            
            //Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
            var htmlMarkup = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">',
                  '<head>',
                    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
                    '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" />',
                    '<title>' + grid.title + '</title>',
                  '</head>',
                  '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body">',
                  /*
                  '<div class="' + Ext.baseCSSPrefix + 'ux-grid-printer-noprint ' + Ext.baseCSSPrefix + 'ux-grid-printer-links">',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
                  '</div>',
                  */
                  '<h1>' + this.mainTitle + '</h1>',
                    '<table>',
                    	'<thead>',
	                      '<tr>',
	                        headings,
	                      '</tr>',
	                    '</thead>',
	                    '<tbody>',
	                      '<tpl for=".">',
	                        '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
	                          body,
	                        '</tr>',
	                        pluginsBodyMarkup.join(''),
	                      '</tpl>',
                      '</tbody>',
                    '</table>',
                  '</body>',
                '</html>'           
            ];
            var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(data);
            // produce inline src content from html
            // var src = 'data:text/html;charset=utf-8,' + escape(html);
            
            var printWindow = Ext.createWidget('window', {
            	requireIcons: ['cross', 'printer'],
            	title: this.printPreviewText + ': ' + grid.title,
            	iconCls: 'icon-printer',
            	width: 640,
            	height: 480,
            	layout: 'fit',
            	animateTarget: targetEl,
            	resizable: false,
                maximizable: true,
            	items: [{
            		xtype: 'uxiframe',
            		itemId: 'iframe'
            	}],
            	dockedItems: [
	                {
	                    xtype: 'toolbar',
	                    dock: 'bottom',
	                    ui: 'footer',
	                    layout: {
	                        pack: 'end',
	                        type: 'hbox'
	                    },
	                    items: [
	                        {
	                            xtype: 'button',
	                            text: this.printLinkText,
	                            iconCls: 'icon-printer',
	                            handler: function(btn, e) {
	                            	var win = iframe.getWin();
	                            	win.focus();
	                            	win.print();
	                            },
	                            scope: this
	                        },
	                        {
	                            xtype: 'button',
	                            text: this.closeLinkText,
	                            iconCls: 'icon-cross',
	                            handler: function(btn, e) {
	                            	this.up('window').close();
	                            }
	                        }
	                    ]
	                }
	            ]
            });
            var iframe = printWindow.down('#iframe');
            printWindow.show(targetEl, function() {
            	var doc = iframe.getDoc();
            	doc.open();
            	doc.write(html);
            	doc.close();
            }, this);                        

            /*
            //open up a new printing window, write to it, print it and close
            var win = window.open('', 'printgrid');
            // fix safari
            //var win=window.open('about:blank','printgrid');
                        
            //document must be open and closed
            win.document.open();
            win.document.write(html);
            win.document.close();
            */
            
            //An attempt to correct the print command to the IE browser
            if (this.printAutomatically){
                if (Ext.isIE){
                    window.print();
                } else {
                    win.print();
                }
            }
            
            //Another way to set the closing of the main
            if (this.closeAutomaticallyAfterPrint){
                if(Ext.isIE){
                    window.close();
                } else {
                    win.close();
                }                
            }
        },

        /**
         * @property stylesheetPath
         * @type String
         * The path at which the print stylesheet can be found (defaults to 'ux/grid/gridPrinterCss/print.css')
         */
        stylesheetPath: null,
        
        /**
         * @property printAutomatically
         * @type Boolean
         * True to open the print dialog automatically and close the window after printing. False to simply open the print version
         * of the grid (defaults to false)
         */
        printAutomatically: false,
        
        /**
         * @property closeAutomaticallyAfterPrint
         * @type Boolean
         * True to close the window automatically after printing.
         * (defaults to false)
         */
        closeAutomaticallyAfterPrint: false,    
        

        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
         */        
        text: '&#160;',
        
        /**
         * @property mainTitle
         * @type String
         * Title to be used on top of the table
         * (defaults to empty)
         */
        mainTitle: '',

        /**
         * Text show as window title
         * @type String
         */
        printPreviewText: 'Printpreview',        
        
        /**
         * Text show on print link
         * @type String
         */
        printLinkText: 'Print',
        
        /**
         * Text show on close link
         * @type String
         */
        closeLinkText: 'Close',
        
        /**
         * @property headerTpl
         * @type {Object/Array} values
         * The markup used to create the headings row. By default this just uses <th> elements, override to provide your own
         */
        headerTpl: [ 
            '<tpl for=".">',
                '<th>{text}</th>',
            '</tpl>',
        ],

        /**
         * @property bodyTpl
         * @type {Object/Array} values
         * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
         * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
         */
        bodyTpl: [
            '<tpl for=".">',
                //'<td>\{{dataIndex}\}</td>',
            	'<td>\{{id}\}</td>',            	
            '</tpl>',
        ]
    }
});