/* Documentation sample */

function loadPage(page) {

	var img = $('<img />');
	img.load(function() {
		var container = $('.sample-docs .p'+page);
		img.css({width: container.width(), height: container.height()});
		img.appendTo($('.sample-docs .p'+page));
		container.find('.loader').remove();
	});

	img.attr('src', '/img/manual/' +  page + '.JPG');

}

function addPage(page, book) {

	var id, pages = book.turn('pages');

	var element = $('<div />', {});

	if (book.turn('addPage', element, page)) {
		if (page<28) {
			element.html('<div class="gradient"></div><div class="loader"></div>');
			loadPage(page);
		}
	}
}

function updateTabs() {
	var tabs = {2: '',
			3: '', 4: '',
			5: '', 6: '',
			7:'',8:'',9:'',10:''},
		book = $('.sample-docs'),
		actualPage = book.turn('page'),
		view = book.turn('view');

	// 탭을 생성할 HTML 문자열
	var tabHtml = '';

	for (var page in tabs) {
		var isHere = $.inArray(parseInt(page, 10), view) !== -1;
		var tabClass = isHere ? 'on' : '';

		tabHtml += `<img class="`+ tabClass +`" src="/img/postit/i`+page+`.png" alt="post-it" onclick="location.href=\'#page/`+ page +`\'">`;
	}

	// .left 요소 내부에 탭 추가
	$('.tabs .tab').html(tabHtml);
}