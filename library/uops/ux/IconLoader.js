/**
 * @class Ext.ux.IconLoader
 * @author Holger Schäfer
 * Icon loader. This method inserts css rules into your page to be used as iconCls.
 * The class will be named "icon-" + whatever the filename is with the underscores replaced
 * with hyphens and without the file extension. <br/><br/>
 * 
 * Silk Icons (1036)
 * http://www.famfamfam.com/lab/icons/silk/
 * http://code.google.com/p/famfamfam/
 * 
 * Flag Icons (247)
 * http://www.famfamfam.com/lab/icons/flags/
 * 
 * Fugue Icons (3470)
 * http://p.yusukekamiyamane.com/
 * 
 * http://tdg-i.com/js/examples/ext/tdgiux/TDGi.iconMgr/
 * 
 * Usage:
 * 
 * 1) initialize icon loader  
 * Ext.ux.IconLoader.initialze('http://famfamfam.googlecode.com/svn/wiki/images/'); //note the trailing slash
 * 
 * 2a) autoload icons by config
 * autoload required icons by via requireIcons config 
 *   new Ext.panel.Panel({
 *     requireIcons: ['accept', 'fugue/anchor', 'fav/uniorg'],
 *     ...
 *   });
 * or single icon inside component
 *   new Ext.Button({
 *     requireIcons: ['accept'],
 *     iconCls: 'icon-accept'
 *   }); 
 * 
 * 2b) autoload icons by coding  
 *   Ext.ux.IconLoader.require(['accept', 'cross']);
 *   Ext.ux.IconLoader.require('accept', 'cross', ...); // loops through arguments (@deprecated) 
 * 
 * 3) use icons via iconCls config (replace silk underscores '_' by '-' in iconCls name!)
 *   new Ext.Button({ iconCls: 'icon-accept' });
 *
 * Original Forum 3.x 
 * Link: http://www.sencha.com/forum/showthread.php?75435-Ext.ux.IconLoader
 * 
 * Added some code fragments from TDGI.iconManager
 * link: http://moduscreate.com/js/examples/ext/tdgiux/TDGi.iconMgr/
 * 
 * Modified by Holger Schäfer (h.schaefer@uniorg.de) - Juli 2012 - Ported to Ext JS 4.1.1
 * http://www.uniorg.de
 */

Ext.define("Ext.ux.IconLoader", {
    requires: [ 'Ext.Component' ],
    
    statics: {
        /**
         * @property path
         * @type String
         * The path to the root of the icons directory
         */
        path: 'http://famfamfam.googlecode.com/svn/wiki/images/',
        
        /**
         * @property path
         * @type Array
         * Array to collect all used icons 
         */
        registry: null,
        
        /**
         * @property useLibPath
         * @type boolean
         * Boolean set to true if using multiple icon libs organized into subdirs 
         */
        useLibPath: true,        
        
    	/**
         * @property addRequireIcons
         * @type Boolean
         * control protyping of Ext.Component to allow use of requireIcons[]
         */        
        addRequireIcons: true,        
        
        initialize: function(config) {        	
        	Ext.apply(this, config);
        	
        	this.registry = new Array();        	
        	if (this.addRequireIcons) { 
        		// overwrite ext class to process requireIcons config on init
	        	Ext.override(Ext.Component, {
	        	    initComponent: function () {	    
	        	    	this.callParent();
	        			if (Ext.isDefined(this.requireIcons)) {
	        				Ext.ux.IconLoader.require(this.requireIcons);
	        			}	    		        			
	        	     }
	        	});
        	}        	
            return this.path;
        },

        /**
         * Require new icons to remotely load via css
         * @param {String}|{Array} icon(s) Filename of an icon or an array containing multiple icons
         * @param {String} icon2 Another filename of the icon for which we will generate a css rule.
         * @param {String} icon3 etc          
         */
        require: function() {    
        	var addIcons = false;
        	var styleId = 'uops-icons';
            Ext.each(arguments, function(icons) {
            	icons = (Ext.isArray(icons)) ? icons : new Array(icons);
        		for (var i = 0, iLen = icons.length; i < iLen; i++) {
        			var icon = icons[i];
        	    	icon = 'ic_' + icon.toString();
        	    	if (!this.registry[icon] && icon != "ic_") {
        				this.registry[icon] = true;			
        				addIcons = true;
        			}			
        		}
            }, this);
            if (addIcons) {
            	// remove css instead adding browser restrictions (IE) on max style length 
            	Ext.util.CSS.removeStyleSheet(styleId);

            	// dynamically build whole new stylesheet    	
            	var newStyle = '';
            	var subLib = '';  
            	for (var iconName in this.registry) {
            		// remove leading 'ic_'
            		iconName = iconName.substr(3);
        			var foundPos = iconName.indexOf('/');
        			var iconExt = 'png';
        			subLib = '';
        			if (foundPos > 0) {
        				iconLib = iconName.substr(0, foundPos);
        				subLib = iconLib;
        				iconName = iconName.substr(foundPos + 1);
        				if (iconLib == 'fav') iconExt = 'gif';
        			} else {
        				iconLib = 'silk';
        				subLib = 'icon';
        			}	
        			iconCls = subLib + '-' + iconName;
        			iconPath = Ext.String.format(
        				'{0}{1}/{2}.{3}', 
        				Ext.ux.IconLoader.path, 
        				(this.useLibPath) ? iconLib : '', 
        				iconName, 
        				iconExt
        			);
        			newStyle += Ext.String.format(
        				".{0} { background-image: url({1}) !important; background-repeat: no-repeat; }\r\n", 
        				iconCls, 
        				iconPath
        			);
            	}    	
            	Ext.util.CSS.createStyleSheet(newStyle, styleId);    	
            };
        },
        
        /**
         * Require new icon by url
         * @param {String} iconUrl Url of icon loaded via icon property
         */
        requireCls: function(iconCls) {
        	if (!Ext.isEmpty(iconCls) && Ext.isString(iconCls)) {
		        // [icon-, fav-, flags-, fugue-] ['', 'fav/', 'flags/', 'fugue/']
		        var pos = iconCls.indexOf('-');
		        var iconGroup = iconCls.substr(0, pos);		
		        if (iconGroup == 'icon') {
		        	// default library (silk)
		            iconGroup = '';
		        } else {
		            iconGroup += '/';  
		        }
		        iconName = iconGroup + iconCls.substr(pos + 1);
		        Ext.ux.IconLoader.require(iconName);
        	}
        }
    }
});