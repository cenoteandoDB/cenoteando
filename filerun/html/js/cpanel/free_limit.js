var panel = new Ext.Panel({
	title: FR.T('Information'), layout:'fit', border: false,
	bodyStyle: 'padding:15px;', closable: true,
	html:
	'FileRun is suitable for up to three user accounts.' +
	'<br><br>' +
	'Although you have reached this limit, it doesn\'t mean you can\'t share files with more people. Here\'s how to do it:<br><br>'+
	'<ul>' +
		'<li>1. Create a new folder.</li>' +
		'<li>2. Right-click the folder and select "Share" &raquo; "Web link".</li>' +
		'<li>3. Access the "Options" tab in the link sharing panel and set a password, enable file uploads or enable the other available options.</li>' +
		'<li>4. Send the web link to the people you wish to share the files with.</li>' +
	'</ul>' +
	'<br>' +
	'FileRun can handle an unlimited number of web links!'+
	'<br><br>' +
	'<span style="color:gray">For larger teams and additional security and administration options please check <a href="http://www.filerun.com/enterprise" target="_blank">this version</a> of the software.</span>'
});
Ext.getCmp('gridTabPanel').add(panel);
panel.show();