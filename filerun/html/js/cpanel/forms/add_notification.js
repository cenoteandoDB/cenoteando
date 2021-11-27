FR.addNotification = {
	actionsList: [],
	setActor: function(data) {
		if (data.users.length > 0) {
			var user = data.users[0];
			this.formPanel.actorDisplay.setValue(user.name);
			this.formPanel.actor.setValue('user|'+user.uid);
		} else {
			if (data.groups.length > 0) {
				var group = data.groups[0];
				this.formPanel.actorDisplay.setValue(group.name);
				this.formPanel.actor.setValue('group|'+group.gid);
			}
		}
	}
};
Ext.each(FR.actions, function(act) {
	FR.addNotification.actionsList.push({xtype: 'checkbox', name:'actions[]', inputValue: act.k, boxLabel: act.t});
});
FR.addNotification.formPanel = new FR.components.editForm({
	title: FR.T('Add Notification Rule'), autoScroll: true,
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 250}, labelWidth: 130,
	items: [
		{
			xtype: 'hidden', ref: 'actor',
			name: 'actor',
			value: ''
		},
		{
			xtype: 'trigger',
			ref: 'actorDisplay', name: 'actor_name', editable: false,
			fieldLabel: FR.T('User or group'), value: '',
			triggerClass: 'fa fa-user-plus',
			onTriggerClick: function(e, btn) {
				if (!this.chooser) {
					this.chooser = new UserChooser({URLRoot: FR.URLRoot, showSelf: true});
				}
				this.chooser.show(btn, FR.addNotification.setActor, FR.addNotification);
				this.chooser.clearChecked();
			}
		},
		{
			xtype: 'compositefield',
			fieldLabel: FR.T('Actions'),
			value: '',
			items: [{
				height: 150, width: 250, autoScroll: true, bodyStyle: 'border:1px solid silver;padding:5px',
				items: FR.addNotification.actionsList
			}]
		},
		{
			xtype: 'textarea',
			fieldLabel: FR.T('Notify e-mail address'),
			name: 'email_address',
			value: ''
		},
		{xtype: 'displayfield', height:10}
	],
	tbar: [
		{
			text: FR.T('Add Notification Rule'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=notifications&section=cpanel&page=add&action=add',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.addNotification.formPanel);
FR.addNotification.formPanel.show();