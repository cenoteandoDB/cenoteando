FR.editNotification = {
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
	FR.editNotification.actionsList.push({xtype: 'checkbox', name:'actions[]', inputValue: act.k, boxLabel: act.t, checked: (FR.ruleInfo.action.indexOf(act.k) !== -1)});
});
FR.editNotification.formPanel = new FR.components.editForm({
	title: FR.T('Edit Notification Rule'), autoScroll: true,
	layout: 'form', bodyStyle: 'padding:10px;', labelWidth: 130,
	defaults: {width: 250},
	items: [
		{
			xtype: 'hidden',
			name: 'id',
			value: FR.ruleInfo.id
		},
		{
			xtype: 'hidden', ref: 'actor',
			name: 'actor',
			value: FR.ruleInfo.actor
		},
		{
			xtype: 'trigger',
			ref: 'actorDisplay', name: 'actor_name',
			fieldLabel: FR.T('User or group'), editable: false,
			allowBlank: false, value: FR.ruleInfo.actorName,
			triggerClass: 'fa fa-user-plus',
			onTriggerClick: function(e, btn) {
				if (!this.chooser) {
					this.chooser = new UserChooser({URLRoot: FR.URLRoot, showSelf: true});
				}
				this.chooser.show(btn, FR.editNotification.setActor, FR.editNotification);
				this.chooser.clearChecked();
			}
		},
		{
			xtype: 'compositefield',
			fieldLabel: FR.T('Actions'),
			items: [{
				height: 150, width: 250, autoScroll: true, bodyStyle: 'border:1px solid silver;padding:5px',
				items: FR.editNotification.actionsList
			}]
		},
		{
			xtype: 'textarea',
			fieldLabel: FR.T('Notify e-mail address'),
			name: 'email_address',
			value: FR.ruleInfo.email_address
		},
		{xtype: 'displayfield', height:10}
	],
	tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=notifications&section=cpanel&page=edit&action=save',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete Notification Rule'),
			iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function(){FR.editNotification.deleteHandler();}
		}
	]
});
FR.editNotification.deleteHandler = function() {
	new Ext.ux.prompt({
		text: FR.T('Please confirm notification rule deletion.'),
		confirmHandler: function() {
			var opts = {
				url: FR.URLRoot+'/?module=notifications&section=cpanel&page=delete&id='+FR.ruleInfo.id,
				maskText: 'Please wait...'
			};
			FR.editNotification.formPanel.deleteAction(opts);
		}
	});
};
Ext.getCmp('gridTabPanel').add(FR.editNotification.formPanel);
FR.editNotification.formPanel.show();