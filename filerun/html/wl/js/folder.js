var FR = {
	hasTerms: hasTerms,
	downloadAllURL: downloadAllURL,
	showEl: function(id) {
		document.getElementById(id).style.display='block';
	},
	hideEl: function(id) {
		document.getElementById(id).style.display='none';
	},
	showUpload: function() {
		var uf = document.getElementById('uploadFrame');
		uf.setAttribute('src', uf.dataset.src);
		this.showEl('upload');
	},
	downloadAll: function () {
		document.getElementById('termsDownBtn').href = this.downloadAllURL;
		this.showEl('terms');
	},
	downloadItem: function(item) {
		document.getElementById('termsDownBtn').href = item.downloadURL;
		this.showEl('terms');
	},
	interceptLinks: function() {
		var links;
		if (listMode) {
			links = document.getElementsByClassName("iconLink");
		} else {
			links = document.getElementsByClassName("filenameRow");
		}
		for (var i = 0; i < links.length; i++) {
			links[i].downloadURL = links[i].href;
			links[i].addEventListener("click", function(e) { FR.downloadItem(this); });
			links[i].href = 'javascript:;';
		}
	}
};
if (FR.hasTerms) {
	FR.interceptLinks();
}